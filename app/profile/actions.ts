'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

function normalizeName(s: string) {
    return s.trim().replace(/\s+/g, ' ')
}

function isValidName(s: string) {
    if (s.length < 2 || s.length > 100) return false
    // Letras (con acentos), espacios, apostrofes y guiones.
    return /^[\p{L}\s'’\-]+$/u.test(s)
}

function isValidDni(s: string) {
    return /^\d{7,9}$/.test(s)
}

export async function saveLegalProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/signin')

    const first_name = normalizeName((formData.get('first_name') as string) || '')
    const last_name = normalizeName((formData.get('last_name') as string) || '')
    const dni = ((formData.get('dni') as string) || '').trim()
    const confirmed = formData.get('confirmed') === 'on'

    if (!isValidName(first_name) || !isValidName(last_name) || !isValidDni(dni)) {
        redirect('/profile?error=invalid')
    }
    if (!confirmed) {
        redirect('/profile?error=not_confirmed')
    }

    // Bloqueo: si ya estaba bloqueado, no permitir cambios desde aqui.
    const { data: existing } = await supabase
        .from('profiles')
        .select('profile_locked_at')
        .eq('id', user.id)
        .single()

    if (existing?.profile_locked_at) {
        redirect('/profile?error=locked')
    }

    const full_name = `${first_name} ${last_name}`

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name,
            last_name,
            dni,
            full_name,
            profile_locked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        // Codigo 23505 = unique violation (DNI duplicado).
        if ((error as any).code === '23505') {
            redirect('/profile?error=dni_taken')
        }
        console.error('saveLegalProfile error:', error)
        redirect('/profile?error=save_error')
    }

    revalidatePath('/profile')
    redirect('/profile?saved=1')
}
