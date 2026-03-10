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
    const video_url = formData.get('video_url') as string

    const { error } = await supabase
        .from('courses')
        .update({
            title,
            subtitle,
            description,
            category,
            video_url,
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

export async function createCourse(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const video_url = formData.get('video_url') as string

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/(^-|-$)+/g, '') // Remove leading/trailing hyphens

    const { error } = await supabase
        .from('courses')
        .insert({
            title,
            slug,
            subtitle,
            description,
            category,
            video_url,
            level: 'Principiante',
            duration: '1h 0m',
            thumbnail: '/placeholder.jpg',
            instructor: 'EducaCivil',
        })

    if (error) {
        console.error('Error creating course:', error)
        return
    }

    revalidatePath('/admin/courses')
    revalidatePath('/courses')
    redirect('/admin/courses')
}

export async function createAiGuide(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const objective = formData.get('objective') as string
    const system_prompt = formData.get('system_prompt') as string
    const category = formData.get('category') as string

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/(^-|-$)+/g, '') // Remove leading/trailing hyphens

    const { error } = await supabase
        .from('ai_guides')
        .insert({
            title,
            slug,
            objective,
            system_prompt,
            category,
            tool: 'Chatbot',
            tools: [],
        })

    if (error) {
        console.error('Error creating guide:', error)
        return
    }

    revalidatePath('/admin/guides')
    revalidatePath('/ai-guides')
    redirect('/admin/guides')
}

export async function createModule(courseId: string, title: string, position: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            title,
            position,
        })

    if (error) {
        console.error('Error creating module:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function updateModule(id: string, courseId: string, title: string, position: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('modules')
        .update({
            title,
            position,
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating module:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function deleteModule(id: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting module:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function createLesson(moduleId: string, courseId: string, title: string, position: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('lessons')
        .insert({
            module_id: moduleId,
            title,
            position,
            duration: '0:00',
            description: '',
            video_url: '',
        })

    if (error) {
        console.error('Error creating lesson:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function updateLesson(id: string, courseId: string, data: { title: string, duration: string, video_url: string, description: string, position: number }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('lessons')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating lesson:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function deleteLesson(id: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lesson:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

