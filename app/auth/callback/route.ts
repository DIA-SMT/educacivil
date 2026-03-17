import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
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
          // If no profile, create it
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString(),
          })
          
          // Redirect to reset-password if that was the intent, otherwise onboarding
          const finalNext = isResetPassword ? next : '/onboarding'
          response.headers.set('Location', `${origin}${finalNext}`)
          return response
        } else if (!profile.full_name && !isResetPassword) {
          response.headers.set('Location', `${origin}/onboarding`)
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
