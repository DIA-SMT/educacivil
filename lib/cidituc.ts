// Integración de login con CiDiTuc (Ciudadano Digital).
//
// hub-ia mantiene su propia sesión, firmada localmente, basada en el token JWT
// que emite CiDiTuc. El flujo es:
//   1. El usuario vuelve desde CiDiTuc con ?auth=<token> (ver auth/cidituc/callback).
//   2. Validamos ese token contra el backend de CiDiTuc (/usuarios/authStatus).
//   3. Firmamos una cookie de sesión propia (HMAC-SHA256) con los datos de la
//      persona + el token original, para poder revalidar o llamar al backend luego.
//
// No se modifica nada de cidituc ni cidituc-backend: solo se consumen sus endpoints.
// Se usa Web Crypto (crypto.subtle) para que funcione tanto en el runtime Node de
// los route handlers como en el runtime Edge del middleware, sin dependencias extra.

export const CIDITUC_SESSION_COOKIE = 'hubia_cidituc_session'

// Datos que devuelve /usuarios/authStatus del backend de CiDiTuc.
export interface CiditucUser {
  id_persona: number
  documento_persona: string
  nombre_persona: string | null
  apellido_persona: string | null
  email_persona: string | null
}

// Payload de nuestra cookie de sesión.
export interface CiditucSession {
  sub: number // id_persona en CiDiTuc
  dni: string
  nombre: string | null
  apellido: string | null
  email: string | null
  src: 'cidituc'
  ct: string // token original de CiDiTuc (para revalidar / llamar al backend)
  exp: number // epoch en segundos
}

function getSessionSecret(): string {
  const secret = process.env.HUBIA_SESSION_SECRET
  if (!secret) {
    throw new Error(
      'Falta HUBIA_SESSION_SECRET en el entorno (necesaria para firmar la sesión de CiDiTuc)'
    )
  }
  return secret
}

function getBackendUrl(): string {
  const url = process.env.CIDITUC_BACKEND_URL
  if (!url) {
    throw new Error('Falta CIDITUC_BACKEND_URL en el entorno')
  }
  return url.replace(/\/$/, '')
}

function getCiditucJwtSecret(): string {
  const secret = process.env.CIDITUC_JWT_SECRET
  if (!secret) {
    throw new Error(
      'Falta CIDITUC_JWT_SECRET en el entorno (JWT_SECRET_KEY del backend de CiDiTuc)'
    )
  }
  return secret
}

// ----------------------------- base64url helpers -----------------------------

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function encodeJson(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

// ------------------------------- HMAC firma ----------------------------------

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

// Firma un payload de sesión y devuelve un token compacto (estilo JWT HS256).
export async function signSession(
  data: Omit<CiditucSession, 'src' | 'exp'>,
  ttlSeconds = 60 * 60 * 24
): Promise<string> {
  const payload: CiditucSession = {
    ...data,
    src: 'cidituc',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const header = encodeJson({ alg: 'HS256', typ: 'JWT' })
  const body = encodeJson(payload)
  const signingInput = `${header}.${body}`
  const key = await importKey(getSessionSecret())
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  )
  return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`
}

// Verifica firma + expiración. Devuelve el payload o null si es inválido.
export async function verifySession(token: string | undefined | null): Promise<CiditucSession | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts

  try {
    const key = await importKey(getSessionSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(`${header}.${body}`)
    )
    if (!valid) return null

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body))
    ) as CiditucSession

    if (payload.src !== 'cidituc') return null
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

// ------------------- verificación LOCAL del JWT de CiDiTuc -------------------

// Verifica localmente el token JWT que emite el backend de CiDiTuc (HS256,
// firmado con JWT_SECRET_KEY). Como todas las apps del municipio comparten ese
// secreto, podemos validar la firma acá mismo sin llamar al backend por red
// (ni depender de su certificado TLS). El payload del backend es { id, iat, exp }.
// Devuelve { id } si la firma es válida y no expiró, o null en caso contrario.
export async function verifyCiditucJwt(
  token: string | undefined | null
): Promise<{ id: number } | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts

  try {
    const key = await importKey(getCiditucJwtSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(`${header}.${body}`)
    )
    if (!valid) return null

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body))
    ) as { id?: number | string; exp?: number }

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    const id = Number(payload.id)
    if (!Number.isFinite(id)) return null
    return { id }
  } catch {
    return null
  }
}

// ------------------------- validación contra CiDiTuc -------------------------

// Llama a /usuarios/authStatus del backend de CiDiTuc con el token recibido.
// Devuelve los datos de la persona si el token es válido, o null si no.
export async function validateCiditucToken(token: string): Promise<CiditucUser | null> {
  const endpoint = `${getBackendUrl()}/usuarios/authStatus`
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        // CiDiTuc espera el token crudo en Authorization (sin "Bearer ").
        Authorization: token,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(
        `[cidituc] authStatus respondió ${res.status} desde ${endpoint} ::`,
        body.slice(0, 300)
      )
      return null
    }

    const data = await res.json()
    const u = data?.usuarioSinContraseña
    if (!u || !u.id_persona) {
      console.error('[cidituc] authStatus OK pero sin usuarioSinContraseña:', JSON.stringify(data).slice(0, 300))
      return null
    }

    return {
      id_persona: u.id_persona,
      documento_persona: String(u.documento_persona ?? ''),
      nombre_persona: u.nombre_persona ?? null,
      apellido_persona: u.apellido_persona ?? null,
      email_persona: u.email_persona ?? null,
    }
  } catch (err) {
    console.error(`[cidituc] error de red llamando a ${endpoint} ::`, err)
    return null
  }
}
