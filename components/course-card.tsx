import Link from 'next/link'
import { Clock, Users, Star, BookOpen, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course } from '@/data/courses'

interface CourseCardProps {
  course: Course
  featured?: boolean
}

const BADGE_STYLES: Record<string, string> = {
  Popular: 'bg-primary/80 text-white border-primary/30 backdrop-blur-md',
  Nuevo: 'bg-cyan-500/80 text-white border-cyan-500/30 backdrop-blur-md',
  Destacado: 'bg-amber-500/80 text-white border-amber-500/30 backdrop-blur-md',
}

const LEVEL_STYLES: Record<string, string> = {
  Principiante: 'text-emerald-600 dark:text-emerald-400',
  Intermedio: 'text-amber-600 dark:text-amber-400',
  Avanzado: 'text-rose-600 dark:text-rose-400',
}

export function CourseCard({ course, featured = false }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:glow-border',
        featured && 'md:flex-row'
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        'relative overflow-hidden bg-muted',
        featured ? 'md:w-64 h-44 md:h-auto flex-shrink-0' : 'h-44'
      )}>
        {course.thumbnail && course.thumbnail !== '/placeholder.jpg' ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 gradient-primary opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
            </div>
          </>
        )}
        {course.badge && (
          <span className={cn(
            'absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold border',
            BADGE_STYLES[course.badge] ?? BADGE_STYLES['Nuevo']
          )}>
            {course.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-xs text-white backdrop-blur-md font-medium">
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className={cn(
            'font-semibold text-foreground leading-snug group-hover:text-primary transition-colors',
            featured ? 'text-lg' : 'text-base'
          )}>
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {course.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-xs font-semibold">{course.rating}</span>
          <span className="text-xs text-muted-foreground ml-1">({course.students.toLocaleString('es')})</span>
        </div>

        <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className={cn('flex items-center gap-1 font-medium', LEVEL_STYLES[course.level])}>
            <BarChart3 className="w-3.5 h-3.5" />
            {course.level}
          </span>
          <span className="flex items-center gap-1 ml-auto text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            {course.students.toLocaleString('es')}
          </span>
        </div>
      </div>
    </Link>
  )
}
