'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Clock, Users, Star, BarChart3, BookOpen, ChevronDown,
  ChevronRight, Play, Download, FileText, Link2, Zap, ArrowLeft
} from 'lucide-react'
import type { Course, Lesson } from '@/data/courses'
import { aiGuides } from '@/data/courses'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/progress-bar'

interface CourseDetailViewProps {
  course: Course
}

function readLessonProgress(courseSlug: string): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(`progress:${courseSlug}`) || '{}')
  } catch {
    return {}
  }
}

function countTotalLessons(course: Course) {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
}

const RESOURCE_ICONS = {
  pdf: FileText,
  doc: FileText,
  link: Link2,
  template: FileText,
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ [course.modules[0]?.id]: true })
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setProgress(readLessonProgress(course.slug))
  }, [course.slug])

  const totalLessons = countTotalLessons(course)
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const firstLesson = course.modules[0]?.lessons[0]
  const relatedGuide = course.aiGuideSlug ? aiGuides.find((g) => g.slug === course.aiGuideSlug) : null

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/courses" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Cursos
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Course Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                {course.level}
              </span>
              {course.badge && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                  {course.badge}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-balance mb-3">{course.title}</h1>
            <p className="text-muted-foreground leading-relaxed mb-4">{course.description}</p>

            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <strong className="text-foreground">{course.rating}</strong>
                ({course.students.toLocaleString('es')} estudiantes)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {totalLessons} lecciones
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Instructor: {course.instructor}
              </span>
            </div>
          </div>

          {/* Course thumbnail placeholder */}
          <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center border border-border">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl glass border border-primary/30 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Vista previa del curso</p>
            </div>
          </div>

          {/* Modules accordion */}
          <div>
            <h2 className="text-xl font-bold mb-4">Contenido del curso</h2>
            <div className="flex flex-col gap-2">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-border overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between gap-4 p-4 text-left bg-card hover:bg-secondary/50 transition-colors"
                    onClick={() => toggleModule(module.id)}
                    aria-expanded={!!openModules[module.id]}
                  >
                    <span className="font-semibold text-sm">{module.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">{module.lessons.length} lecciones</span>
                      <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', openModules[module.id] && 'rotate-180')} />
                    </div>
                  </button>
                  {openModules[module.id] && (
                    <div className="divide-y divide-border">
                      {module.lessons.map((lesson) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          courseSlug={course.slug}
                          completed={!!progress[lesson.id]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Start CTA */}
          <div className="glass rounded-xl p-6 flex flex-col gap-4 sticky top-24">
            <ProgressBar value={progressPct} showLabel size="md" />
            <p className="text-xs text-muted-foreground text-center">
              {completedCount}/{totalLessons} lecciones completadas
            </p>

            {firstLesson && (
              <Link
                href={`/learn/${course.slug}?lesson=${firstLesson.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" />
                {completedCount > 0 ? 'Continuar curso' : 'Comenzar curso'}
              </Link>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-border text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Nivel</span>
                <span className="text-foreground font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Duración</span>
                <span className="text-foreground font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Módulos</span>
                <span className="text-foreground font-medium">{course.modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Lecciones</span>
                <span className="text-foreground font-medium">{totalLessons}</span>
              </div>
            </div>
          </div>

          {/* Related AI Guide */}
          {relatedGuide && (
            <div className="glass rounded-xl p-5 border border-primary/20 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">Guía de IA relacionada</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{relatedGuide.title}</p>
              <Link
                href={`/ai-guides/${relatedGuide.slug}`}
                className="text-xs text-primary font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                Abrir guía
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LessonRow({ lesson, courseSlug, completed }: { lesson: Lesson; courseSlug: string; completed: boolean }) {
  return (
    <Link
      href={`/learn/${courseSlug}?lesson=${lesson.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors group"
    >
      <div className={cn(
        'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors',
        completed ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
      )}>
        {completed ? (
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Play className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary" />
        )}
      </div>
      <span className={cn('text-sm flex-1 leading-snug', completed ? 'text-muted-foreground line-through' : 'text-foreground')}>
        {lesson.title}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 font-mono">{lesson.duration}</span>
    </Link>
  )
}
