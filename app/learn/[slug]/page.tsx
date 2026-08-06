import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/server'
import { ClassroomView } from '@/components/learn/classroom-view'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 0

/**
 * Normaliza una relación embebida de PostgREST a un único objeto, sirva la
 * relación como objeto (to-one) o como array (to-many).
 */
function toOne<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null
  return Array.isArray(rel) ? (rel[0] ?? null) : rel
}

export async function generateStaticParams() {
  const { data: courses } = await supabase.from('courses').select('slug')
  return (courses || []).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single()
  if (!course) return {}
  return {
    title: `Aula — ${course.title} | CiviLearn`,
  }
}

export default async function LearnPage({ params }: Props) {
  const { slug } = await params

  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, slug, title, subtitle, category, level, duration, badge,
      thumbnail, description, instructor, rating, students, ai_guide_slug,
      modules (
        id, title, position,
        lessons (
          id, title, duration, video_url, description, position,
          resources (id, title, type, url),
          lesson_quizzes (
            id, title, description,
            quiz_questions (id, question_text, options, correct_option_index, explanation, position)
          )
        )
      )
    `)
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  // Fetch related AI guide if present
  let relatedGuide = null
  if (course.ai_guide_slug) {
    const { data: guide } = await supabase
      .from('ai_guides')
      .select('slug, title')
      .eq('slug', course.ai_guide_slug)
      .single()
    relatedGuide = guide
  }

  const sortedCourse = {
    ...course,
    aiGuideSlug: course.ai_guide_slug,
    modules: (course.modules || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((mod: any) => ({
        ...mod,
        lessons: (mod.lessons || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((lesson: any) => ({
            ...lesson,
            videoUrl: lesson.video_url,
            resources: lesson.resources || [],
            // `lesson_quizzes` es una relación to-ONE: PostgREST devuelve un
            // objeto (o null), no un array. El `?.[0]` de antes daba siempre
            // undefined y por eso el cuestionario nunca aparecía en el aula.
            quiz: toOne(lesson.lesson_quizzes),
          })),
      })),
  }

  // Fetch course feedback
  const supabaseAuth = await createClient()
  const { data: feedbackData } = await supabaseAuth
    .from('course_feedback')
    .select('id, rating, comment, created_at, lesson_id')
    .eq('course_slug', slug)
    .order('created_at', { ascending: false })

  const initialFeedback = feedbackData ?? []

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando aula...</div>}>
      <ClassroomView course={sortedCourse as any} relatedGuide={relatedGuide} initialFeedback={initialFeedback} />
    </Suspense>
  )
}
