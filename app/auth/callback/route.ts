import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = getBaseUrl()
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

        if (!profile?.full_name) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_error`)
}
