import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'
import {
  CIDITUC_SESSION_COOKIE,
  signSession,
  validateCiditucToken,
  verifyCiditucJwt,
} from '@/lib/cidituc'

// Vuelta desde CiDiTuc: /auth/cidituc/callback?auth=<token>&next=<ruta>
// Verifica el token localmente (firma HS256 con el secreto compartido del
// backend), firma nuestra cookie de sesión y redirige a la app. No toca
// Supabase: es una sesión paralela.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('auth')
  const requestedNext = searchParams.get('next')
  const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/'
  const origin = await getBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${origin}/signin?error=cidituc_missing_token`)
  }

  // Autenticación: verificamos la firma del token localmente con el secreto
  // compartido. No depende de una llamada de red al backend ni de su cert TLS.
  const claims = await verifyCiditucJwt(token)
  if (!claims) {
    return NextResponse.redirect(`${origin}/signin?error=cidituc_invalid_token`)
  }

  // Best-effort: si el backend está accesible, enriquecemos con nombre/email/dni.
  // Si falla (p.ej. por el certificado), igual dejamos entrar con lo mínimo: el
  // token ya quedó verificado localmente, así que la sesión es válida.
  const user = await validateCiditucToken(token)

  const sessionToken = await signSession({
    sub: claims.id,
    dni: user?.documento_persona ?? '',
    nombre: user?.nombre_persona ?? null,
    apellido: user?.apellido_persona ?? null,
    email: user?.email_persona ?? null,
    ct: token,
  })

  const response = NextResponse.redirect(`${origin}${next}`)
  response.cookies.set(CIDITUC_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h, acompaña la expiración del token de CiDiTuc
  })
  return response
}
