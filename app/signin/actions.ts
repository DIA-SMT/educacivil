'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = getBaseUrl()

  const next = formData.get('next') as string | null

  const redirectTo = next
    ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error || !data.url) {
    redirect('/signin?error=google_error')
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/signin')

  const full_name = formData.get('full_name') as string

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    redirect('/onboarding?error=save_error')
  }

  redirect('/')
}
