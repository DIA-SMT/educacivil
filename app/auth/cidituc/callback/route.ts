import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getBaseUrl } from '@/utils/url'
import {
  CIDITUC_SESSION_COOKIE,
  signSession,
  verifyCiditucJwt,
} from '@/lib/cidituc'
import { validateCiditucToken } from '@/lib/cidituc-backend'
import { createServiceClient } from '@/utils/supabase/service'
import { ensureShadowUser, prefillCiditucProfile, repairShadowPassword } from '@/lib/cidituc-provision'

// Vuelta desde CiDiTuc: /auth/cidituc/callback?auth=<token>&next=<ruta>
// 1. Verifica el token localmente (firma HS256 con el secreto compartido).
// 2. Abre una sesión REAL de Supabase sobre un "usuario-sombra" manejado por
//    detrás (ver lib/cidituc-provision.ts). Así el data layer (progreso,
//    certificados, RLS) funciona sin cambios.
// 3. Prellena y bloquea el perfil legal con los datos oficiales de CiDiTuc, para
//    que el certificado salga con el nombre y DNI reales del vecino.
// 4. Firma además nuestra cookie de CiDiTuc (guarda el token para llamar al
//    backend luego) y registra el ingreso para la trazabilidad del admin.
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
  // token ya quedó verificado localmente. El perfil quedará para completar a mano.
  const user = await validateCiditucToken(token)

  // Respuesta a la que colgamos tanto las cookies de sesión de Supabase como la
  // nuestra de CiDiTuc.
  const response = NextResponse.redirect(`${origin}${next}`)

  // --- Identidad: usuario-sombra de Supabase manejado por CiDiTuc ---
  // Aseguramos que exista el usuario de Supabase para esta persona y abrimos su
  // sesión real. signInWithPassword escribe las cookies sb-* en la respuesta.
  let supabaseUserId: string
  try {
    const { email, password } = await ensureShadowUser(claims.id)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    let signIn = await supabase.auth.signInWithPassword({ email, password })
    if (signIn.error) {
      // La contraseña puede no coincidir si el usuario-sombra se creó con otro
      // HUBIA_SESSION_SECRET (otro entorno o rotación del secreto). Reseteamos la
      // contraseña al valor actual y reintentamos una sola vez.
      console.warn(
        '[cidituc] login del usuario-sombra falló, intentando reparar la contraseña:',
        signIn.error.message
      )
      try {
        await repairShadowPassword(email, password)
        signIn = await supabase.auth.signInWithPassword({ email, password })
      } catch (repairErr) {
        console.error(
          '[cidituc] no se pudo reparar la contraseña del usuario-sombra:',
          repairErr instanceof Error ? repairErr.message : repairErr
        )
      }
    }
    if (signIn.error || !signIn.data.user) {
      console.error(
        '[cidituc] no se pudo abrir la sesión de Supabase del usuario-sombra:',
        signIn.error?.message
      )
      return NextResponse.redirect(`${origin}/signin?error=cidituc_session_failed`)
    }
    supabaseUserId = signIn.data.user.id
  } catch (err) {
    console.error(
      '[cidituc] error creando/abriendo la sesión de Supabase:',
      err instanceof Error ? err.message : err
    )
    return NextResponse.redirect(`${origin}/signin?error=cidituc_session_failed`)
  }

  // --- Perfil legal: prellenar y bloquear con los datos oficiales de CiDiTuc ---
  // Best-effort: si falla, el vecino igual puede completarlo a mano en /profile.
  if (user) {
    try {
      await prefillCiditucProfile(supabaseUserId, {
        nombre: user.nombre_persona,
        apellido: user.apellido_persona,
        documento: user.documento_persona,
        email: user.email_persona,
      })
    } catch (err) {
      console.error(
        '[cidituc] no se pudo prellenar el perfil legal:',
        err instanceof Error ? err.message : err
      )
    }
  }

  // --- Cookie propia de CiDiTuc (guarda el token para revalidar / llamar al backend) ---
  const sessionToken = await signSession({
    sub: claims.id,
    dni: user?.documento_persona ?? '',
    nombre: user?.nombre_persona ?? null,
    apellido: user?.apellido_persona ?? null,
    email: user?.email_persona ?? null,
    ct: token,
  })
  response.cookies.set(CIDITUC_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h, acompaña la expiración del token de CiDiTuc
  })

  // --- Trazabilidad: registramos el ingreso en Supabase para verlo en el admin. ---
  // Best-effort: si falla (falta service key, red, etc.) no bloqueamos el login.
  try {
    const svc = createServiceClient()
    await svc.rpc('registrar_ingreso_cidituc', {
      p_id_persona: claims.id,
      p_dni: user?.documento_persona ?? '',
      p_nombre: user?.nombre_persona ?? null,
      p_apellido: user?.apellido_persona ?? null,
      p_email: user?.email_persona ?? null,
    })
  } catch (err) {
    console.error(
      '[cidituc] no se pudo registrar el ingreso para trazabilidad:',
      err instanceof Error ? err.message : err
    )
  }

  return response
}
