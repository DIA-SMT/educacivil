import { notFound } from 'next/navigation'
import { courses } from '@/data/courses'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CourseDetailView } from '@/components/courses/course-detail-view'

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
    title: `${course.title} — CiviLearn`,
    description: course.description,
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const course = courses.find((c) => c.slug === slug)
  if (!course) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <CourseDetailView course={course} />
      </main>
      <Footer />
    </div>
  )
}
