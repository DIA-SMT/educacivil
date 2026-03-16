import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const origin = await getBaseUrl()

  // Create the response object first so we can sync cookies to it
  const redirectTo = `${origin}${next.startsWith('/') ? next : `/${next}`}`
  const response = NextResponse.redirect(redirectTo)

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

        if (!profile) {
          // If no profile, create it and redirect to onboarding
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString(),
          })
          
          // Use the same response object but change the location
          response.headers.set('Location', `${origin}/onboarding`)
          return response
        } else if (!profile.full_name) {
          response.headers.set('Location', `${origin}/onboarding`)
          return response
        } else {
          // Update avatar if it changed
          await supabase
            .from('profiles')
            .update({ 
              avatar_url: user.user_metadata.avatar_url,
              updated_at: new Date().toISOString() 
            })
            .eq('id', user.id)
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
