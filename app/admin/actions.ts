'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

async function isAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/')
}

export async function updateAiGuide(id: string, formData: FormData) {
    await isAdmin()
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
    await isAdmin()
    const supabase = await createClient()

    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const video_url = formData.get('video_url') as string
    const thumbnailFile = formData.get('thumbnail') as File | null

    const updateData: any = {
        title,
        subtitle,
        description,
        category,
        video_url,
    }

    if (thumbnailFile && thumbnailFile.size > 0) {
        const fileExt = thumbnailFile.name.split('.').pop() || 'jpg'
        const fileName = `${id}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('thumbnails')
            .upload(fileName, thumbnailFile, {
                upsert: true,
                contentType: thumbnailFile.type || 'image/jpeg',
            })
        if (uploadError) {
            throw new Error(`Thumbnail upload failed: ${uploadError.message}`)
        }
        const { data: { publicUrl } } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(fileName)
        updateData.thumbnail = publicUrl
    }

    const { error } = await supabase
        .from('courses')
        .update(updateData)
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
    const supabase = await createClient()

    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const video_url = formData.get('video_url') as string
    const thumbnailFile = formData.get('thumbnail') as File | null

    let thumbnailUrl = '/placeholder.jpg'

    if (thumbnailFile && thumbnailFile.size > 0) {
        try {
            const fileExt = thumbnailFile.name.split('.').pop() || 'jpg'
            const fileName = `new_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('thumbnails')
                .upload(fileName, thumbnailFile, {
                    upsert: true,
                    contentType: thumbnailFile.type || 'image/jpeg',
                })
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(fileName)
            thumbnailUrl = publicUrl
        } catch (error) {
            console.error('Error uploading thumbnail:', error)
        }
    }

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
            thumbnail: thumbnailUrl,
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
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
    await isAdmin()
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

export async function createResource(lessonId: string, courseId: string, title: string, type: 'pdf' | 'link' | 'doc' | 'template', url: string) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('resources')
        .insert({
            lesson_id: lessonId,
            title,
            type,
            url,
        })

    if (error) {
        console.error('Error creating resource:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function deleteResource(id: string, courseId: string) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting resource:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

// ---------------------------------------------------------
// Quiz Actions
// ---------------------------------------------------------

export async function createQuiz(lessonId: string, courseId: string, title: string) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('lesson_quizzes')
        .insert({
            lesson_id: lessonId,
            title,
        })

    if (error) {
        console.error('Error creating quiz:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function updateQuiz(id: string, courseId: string, data: { title: string, description?: string }) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('lesson_quizzes')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating quiz:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function deleteQuiz(id: string, courseId: string) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('lesson_quizzes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting quiz:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

// ---------------------------------------------------------
// Question Actions
// ---------------------------------------------------------

export async function addQuestion(quizId: string, courseId: string, data: { question_text: string, options: string[], correct_option_index: number, explanation?: string, position?: number }) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('quiz_questions')
        .insert({
            quiz_id: quizId,
            ...data
        })

    if (error) {
        console.error('Error adding question:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function updateQuestion(id: string, courseId: string, data: { question_text?: string, options?: string[], correct_option_index?: number, explanation?: string, position?: number }) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('quiz_questions')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating question:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function deleteQuestion(id: string, courseId: string) {
    await isAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting question:', error)
        return { error: error.message }
    }

    revalidatePath(`/admin/courses/${courseId}`)
    return { success: true }
}

export async function submitQuizAttempt(quizId: string, score: number, answers: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('quiz_attempts')
        .insert({
            user_id: user.id,
            quiz_id: quizId,
            score,
            answers,
        })

    if (error) {
        console.error('Error submitting quiz attempt:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function adminUpdateUserProfile(userId: string, formData: FormData) {
    await isAdmin()
    const supabase = await createClient()

    const first_name = ((formData.get('first_name') as string) || '').trim().replace(/\s+/g, ' ')
    const last_name = ((formData.get('last_name') as string) || '').trim().replace(/\s+/g, ' ')
    const dni = ((formData.get('dni') as string) || '').trim()
    const unlock = formData.get('unlock') === 'on'

    if (
        first_name.length < 2 || first_name.length > 100 ||
        last_name.length < 2 || last_name.length > 100 ||
        !/^\d{7,9}$/.test(dni)
    ) {
        redirect(`/admin/users/${userId}?error=invalid`)
    }

    const updateData: any = {
        first_name,
        last_name,
        dni,
        full_name: `${first_name} ${last_name}`,
        updated_at: new Date().toISOString(),
    }
    if (unlock) {
        updateData.profile_locked_at = null
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

    if (error) {
        if ((error as any).code === '23505') {
            redirect(`/admin/users/${userId}?error=dni_taken`)
        }
        console.error('adminUpdateUserProfile error:', error)
        redirect(`/admin/users/${userId}?error=save_error`)
    }

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    redirect(`/admin/users/${userId}?saved=1`)
}
