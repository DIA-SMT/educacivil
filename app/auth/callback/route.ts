import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = await getBaseUrl()
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has a profile with a name, if not → onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // If no profile exists, create one with Google metadata
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata.full_name,
              avatar_url: user.user_metadata.avatar_url,
              updated_at: new Date().toISOString(),
            })
        } else if (!profile.full_name) {
          // If profile exists but no name, prompt for onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        } else {
          // Update avatar if it changed or was missing
          await supabase
            .from('profiles')
            .update({ 
              avatar_url: user.user_metadata.avatar_url,
              updated_at: new Date().toISOString() 
            })
            .eq('id', user.id)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_error`)
}
