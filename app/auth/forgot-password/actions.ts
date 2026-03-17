'use server'

import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'
import { redirect } from 'next/navigation'

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()
  const origin = await getBaseUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/auth/forgot-password?success=true')
}
