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
  if (!token) {
    console.error('[cidituc] verifyJwt: no llegó token')
    return null
  }
  const parts = token.split('.')
  if (parts.length !== 3) {
    console.error('[cidituc] verifyJwt: el token no tiene formato JWT (3 partes)')
    return null
  }
  const [header, body, signature] = parts

  try {
    const key = await importKey(getCiditucJwtSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(`${header}.${body}`)
    )
    if (!valid) {
      console.error(
        '[cidituc] verifyJwt: firma inválida — CIDITUC_JWT_SECRET no coincide con el JWT_SECRET_KEY del backend que emitió el token'
      )
      return null
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body))
    ) as { id?: number | string; exp?: number }

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('[cidituc] verifyJwt: token expirado')
      return null
    }

    const id = Number(payload.id)
    if (!Number.isFinite(id)) {
      console.error('[cidituc] verifyJwt: el payload no tiene un id válido')
      return null
    }
    return { id }
  } catch (err) {
    console.error(
      '[cidituc] verifyJwt: error (¿falta CIDITUC_JWT_SECRET en el entorno?):',
      err instanceof Error ? err.message : err
    )
    return null
  }
}

// La consulta al backend (validateCiditucToken) vive en lib/cidituc-backend.ts:
// usa APIs de Node y no debe entrar al bundle Edge del middleware, que importa
// este archivo. Acá solo queda lo que corre en ambos runtimes (firma/verificación
// con Web Crypto).
