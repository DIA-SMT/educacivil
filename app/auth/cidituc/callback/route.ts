import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'
import {
  CIDITUC_SESSION_COOKIE,
  signSession,
  validateCiditucToken,
} from '@/lib/cidituc'

// Vuelta desde CiDiTuc: /auth/cidituc/callback?auth=<token>&next=<ruta>
// Valida el token contra el backend de CiDiTuc, firma nuestra cookie de sesión
// y redirige a la app. No toca Supabase: es una sesión paralela.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('auth')
  const requestedNext = searchParams.get('next')
  const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/'
  const origin = await getBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${origin}/signin?error=cidituc_missing_token`)
  }

  const user = await validateCiditucToken(token)
  if (!user) {
    return NextResponse.redirect(`${origin}/signin?error=cidituc_invalid_token`)
  }

  const sessionToken = await signSession({
    sub: user.id_persona,
    dni: user.documento_persona,
    nombre: user.nombre_persona,
    apellido: user.apellido_persona,
    email: user.email_persona,
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
