import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const requestedNext = searchParams.get('next')
  const next =
    requestedNext ??
    (type === 'recovery' || token_hash ? '/auth/reset-password' : '/')
  const origin = await getBaseUrl()

  // Create the final redirect URL
  const redirectTo = `${origin}${next.startsWith('/') ? next : `/${next}`}`
  
  // We'll create the response later to ensure we have the correct location
  const response = NextResponse.redirect(redirectTo)

  // Handle token_hash flow (used by password recovery emails)
  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'recovery' | 'signup' | 'email' | 'invite' | 'email_change',
      token_hash,
    })

    if (!error) {
      response.headers.set('Location', redirectTo)
      return response
    }
  }

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        // If it's a password reset flow, we MUST go to reset-password first
        const isResetPassword = next.includes('reset-password')

        if (!profile) {
          // Si no hay profile, lo creamos prellenando lo que vino de Google.
          const meta = user.user_metadata || {}
          const fullNameFromMeta: string | undefined = meta.full_name || meta.name
          const firstNameFromMeta: string | undefined =
            meta.given_name || (fullNameFromMeta ? fullNameFromMeta.split(' ')[0] : undefined)
          const lastNameFromMeta: string | undefined =
            meta.family_name ||
            (fullNameFromMeta ? fullNameFromMeta.split(' ').slice(1).join(' ') || undefined : undefined)

          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: fullNameFromMeta,
            first_name: firstNameFromMeta,
            last_name: lastNameFromMeta,
            avatar_url: meta.avatar_url,
            updated_at: new Date().toISOString(),
          })

          // Reset password flow tiene prioridad; si no, mandamos a /profile
          // para que complete/verifique nombre, apellido y DNI.
          const finalNext = isResetPassword ? next : '/profile'
          response.headers.set('Location', `${origin}${finalNext}`)
          return response
        } else if (!profile.full_name && !isResetPassword) {
          response.headers.set('Location', `${origin}/profile`)
          return response
        } else {
          // Existing user with complete profile or in reset flow
          // The response already has the correct Location from 'redirectTo'
          // but we'll set it again just to be absolutely sure
          response.headers.set('Location', redirectTo)
        }
      }
      return response
    }
  }

  // Error case
  return NextResponse.redirect(`${origin}/signin?error=auth_error`)
}

// Helper to parse cookies from header
function parseCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(';')
    .filter(Boolean)
    .map((v) => v.split('='))
    .reduce((acc: { name: string; value: string }[], v) => {
      const name = v[0]?.trim()
      const value = v[1]?.trim()
      if (name && value) {
        acc.push({ name, value })
      }
      return acc
    }, [])
}
