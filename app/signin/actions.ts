'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = await getBaseUrl()

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

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/signin?error=auth_error&email=${encodeURIComponent(email)}`)
  }

  redirect('/')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const origin = await getBaseUrl()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signin?error=signup_error&email=${encodeURIComponent(email)}`)
  }

  // If Supabase is configured to require email confirmation, 
  // 'user' will be present but 'session' will be null.
  if (data.user && !data.session) {
    redirect(`/signin?message=confirm_email&email=${encodeURIComponent(email)}`)
  }

  // If auto-logged in (common in some configs), go to onboarding
  redirect('/onboarding')
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
