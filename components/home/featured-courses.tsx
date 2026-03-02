import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { courses } from '@/data/courses'
import { CourseCard } from '@/components/course-card'

export function FeaturedCourses() {
  const featured = courses.filter((c) => c.badge !== null).slice(0, 3)

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Cursos destacados
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
              Empieza con los{' '}
              <span className="neon-text-cyan">más populares</span>
            </h2>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm text-primary hover:opacity-80 font-medium shrink-0 transition-opacity"
          >
            Ver todos los cursos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}
