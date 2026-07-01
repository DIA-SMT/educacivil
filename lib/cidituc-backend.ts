// Consulta al backend de CiDiTuc para enriquecer el perfil (nombre, email, dni).
//
// Vive aparte de lib/cidituc.ts a propósito: usa el módulo `https` de Node y NO
// debe entrar al bundle Edge del middleware. Solo lo importan route handlers
// (runtime Node).
//
// IMPORTANTE: la AUTENTICACIÓN no depende de esta llamada. El token ya se
// verifica por firma en verifyCiditucJwt (lib/cidituc.ts). Esto es solo para
// mostrar los datos de la persona.

import https from 'node:https'
import type { CiditucUser } from './cidituc'

function getBackendUrl(): string {
  const url = process.env.CIDITUC_BACKEND_URL
  if (!url) {
    throw new Error('Falta CIDITUC_BACKEND_URL en el entorno')
  }
  return url.replace(/\/$/, '')
}

interface HttpResult {
  status: number
  body: string
}

// GET al backend usando https nativo, para poder controlar la verificación del
// certificado por request (fetch global no expone esa opción).
function httpsGet(
  endpoint: string,
  token: string,
  rejectUnauthorized: boolean
): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint)
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        // CiDiTuc espera el token crudo en Authorization (sin "Bearer ").
        headers: { Authorization: token },
        rejectUnauthorized,
      },
      (res) => {
        let data = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }))
      }
    )
    req.on('error', reject)
    req.end()
  })
}

// Llama a /usuarios/authStatus del backend de CiDiTuc con el token recibido.
// Devuelve los datos de la persona si el token es válido, o null si no.
//
// Con CIDITUC_ALLOW_INSECURE_TLS=true tolera la cadena TLS incompleta del backend
// (cert sin el intermedio de Sectigo). Es un parche temporal: apagá la variable
// en cuanto infra sirva la cadena completa.
export async function validateCiditucToken(token: string): Promise<CiditucUser | null> {
  const endpoint = `${getBackendUrl()}/usuarios/authStatus`
  const rejectUnauthorized = process.env.CIDITUC_ALLOW_INSECURE_TLS !== 'true'

  try {
    const res = await httpsGet(endpoint, token, rejectUnauthorized)

    if (res.status < 200 || res.status >= 300) {
      console.error(
        `[cidituc] authStatus respondió ${res.status} desde ${endpoint} ::`,
        res.body.slice(0, 300)
      )
      return null
    }

    const data = JSON.parse(res.body)
    const u = data?.usuarioSinContraseña
    if (!u || !u.id_persona) {
      console.error(
        '[cidituc] authStatus OK pero sin usuarioSinContraseña:',
        JSON.stringify(data).slice(0, 300)
      )
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
