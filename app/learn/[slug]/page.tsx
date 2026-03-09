import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ClassroomView } from '@/components/learn/classroom-view'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 0

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
          resources (id, title, type, url)
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
          })),
      })),
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando aula...</div>}>
      <ClassroomView course={sortedCourse as any} relatedGuide={relatedGuide} />
    </Suspense>
  )
}
