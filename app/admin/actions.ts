'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updateAiGuide(id: string, formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const objective = formData.get('objective') as string
    const system_prompt = formData.get('system_prompt') as string
    const category = formData.get('category') as string

    const { error } = await supabase
        .from('ai_guides')
        .update({
            title,
            objective,
            system_prompt,
            category,
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating guide:', error)
        return
    }

    revalidatePath('/admin/guides')
    revalidatePath(`/ai-guides/${formData.get('slug')}`)
    redirect('/admin/guides')
}

export async function updateCourse(id: string, formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string

    const { error } = await supabase
        .from('courses')
        .update({
            title,
            subtitle,
            description,
            category,
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating course:', error)
        return
    }

    revalidatePath('/admin/courses')
    revalidatePath(`/courses/${formData.get('slug')}`)
    redirect('/admin/courses')
}

export async function deleteAiGuide(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('ai_guides')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting guide:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/guides')
    return { success: true }
}

export async function deleteCourse(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting course:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/courses')
    return { success: true }
}
