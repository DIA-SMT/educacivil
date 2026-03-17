'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return redirect('/auth/reset-password?error=Las contraseñas no coinciden')
  }

  if (password.length < 6) {
    return redirect('/auth/reset-password?error=La contraseña debe tener al menos 6 caracteres')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/signin?message=password_updated')
}
