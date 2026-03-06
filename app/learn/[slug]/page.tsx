import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { courses } from '@/data/courses'
import { ClassroomView } from '@/components/learn/classroom-view'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const course = courses.find((c) => c.slug === slug)
  if (!course) return {}
  return {
    title: `Aula — ${course.title} | CiviLearn`,
  }
}

export default async function LearnPage({ params }: Props) {
  const { slug } = await params
  const course = courses.find((c) => c.slug === slug)
  if (!course) notFound()

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando aula...</div>}>
      <ClassroomView course={course} />
    </Suspense>
  )
}
