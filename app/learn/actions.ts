'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// =============================================
// Feedback Actions
// =============================================

export async function submitFeedback(
  courseSlug: string,
  lessonId: string,
  rating: number,
  comment: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }
  if (rating < 1 || rating > 5) return { error: 'Rating inválido' }

  const { error } = await supabase
    .from('course_feedback')
    .insert({
      user_id: user.id,
      course_slug: courseSlug,
      lesson_id: lessonId,
      rating,
      comment: comment.trim() || null,
    })

  if (error) {
    console.error('Error submitting feedback:', error)
    return { error: error.message }
  }

  revalidatePath(`/learn/${courseSlug}`)
  return { success: true }
}

export async function getCourseFeedback(courseSlug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('course_feedback')
    .select('id, rating, comment, created_at, lesson_id, user_id')
    .eq('course_slug', courseSlug)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedback:', error)
    return []
  }

  return data ?? []
}

// =============================================
// Lesson Progress Actions
// =============================================

export async function getLessonProgress(courseSlug: string): Promise<Record<string, boolean>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return {}

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id)
    .eq('course_slug', courseSlug)

  if (error) {
    console.error('Error fetching progress:', error)
    return {}
  }

  const result: Record<string, boolean> = {}
  for (const row of data ?? []) {
    result[row.lesson_id] = row.completed
  }
  return result
}

export async function markLessonComplete(
  courseSlug: string,
  lessonId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: user.id,
        course_slug: courseSlug,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )

  if (error) {
    console.error('Error marking lesson complete:', error)
    return { error: error.message }
  }

  revalidatePath(`/learn/${courseSlug}`)
  return { success: true }
}
