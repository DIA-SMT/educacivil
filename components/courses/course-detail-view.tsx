'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Clock, Users, Star, BarChart3, BookOpen, ChevronDown,
  ChevronRight, Play, Download, FileText, Link2, Zap, ArrowLeft, Trophy
} from 'lucide-react'
import type { Course, Lesson } from '@/data/courses'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/progress-bar'
import { getLessonProgress } from '@/app/learn/actions'
import { getVideoKind, getYouTubeId, getYouTubeStart, getVimeoId, getIframeEmbedUrl } from '@/lib/video'

interface RelatedGuide {
  slug: string
  title: string
}

interface CourseDetailViewProps {
  course: Course
  relatedGuide?: RelatedGuide | null
}

function countTotalLessons(course: Course) {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
}

/**
 * URL de <iframe> para el video de presentación del curso.
 * Devuelve null si el enlace no es de un proveedor incrustable; ahí mostramos
 * el botón "Ver video del curso" en vez de un iframe roto.
 */
function getEmbedUrl(url: string): string | null {
  const kind = getVideoKind(url)
  if (kind === 'youtube') {
    const id = getYouTubeId(url)
    const start = getYouTubeStart(url)
    return id
      ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${start ? `&start=${start}` : ''}`
      : null
  }
  if (kind === 'vimeo') return `https://player.vimeo.com/video/${getVimeoId(url)}`
  return getIframeEmbedUrl(url)   // Loom / Google Drive
}

const RESOURCE_ICONS = {
  pdf: FileText,
  doc: FileText,
  link: Link2,
  template: FileText,
}

export function CourseDetailView({ course, relatedGuide }: CourseDetailViewProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ [course.modules[0]?.id]: true })
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false

    const loadProgress = async () => {
      const nextProgress = await getLessonProgress(course.slug)
      if (!cancelled) {
        setProgress(nextProgress)
      }
    }

    const handleRefresh = () => {
      void loadProgress()
    }

    void loadProgress()
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleRefresh)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleRefresh)
    }
  }, [course.slug])

  const totalLessons = countTotalLessons(course)
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const firstLesson = course.modules[0]?.lessons[0]
  // relatedGuide is passed as a prop from the server page

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/5 blur-[120px] -z-10" />
      <div className="absolute top-40 left-0 w-1/3 h-96 bg-indigo-500/5 blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-8 px-1">
        <Link href="/courses" className="flex items-center gap-1.5 hover:text-primary transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          Cursos
        </Link>
        <ChevronRight className="w-3 h-3 opacity-40" />
        <span className="text-muted-foreground truncate max-w-[200px]">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Course Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-lg bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                {course.level}
              </span>
              {course.badge && (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  {course.badge}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-balance mb-6 tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              {course.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <strong className="text-foreground">{course.rating}</strong>
                  {course.students > 0 && `(${course.students.toLocaleString('es')} estudiantes)`}
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              )}
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

          {/* Course thumbnail placeholder / Video Embed */}
          {course.video_url ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-border/50 shadow-2xl group">
              {getEmbedUrl(course.video_url) ? (
                <iframe
                  src={getEmbedUrl(course.video_url)!}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={course.title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-4">
                  <a href={course.video_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-2xl glass border border-primary/30 flex items-center justify-center bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                      <Play className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium text-white px-4 py-2 bg-black/60 rounded-full backdrop-blur-md">Ver video del curso</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={firstLesson ? `/learn/${course.slug}?lesson=${firstLesson.id}` : '#'}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-border/50 group shadow-2xl transition-all duration-300",
                !firstLesson && "cursor-not-allowed"
              )}
            >
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent opacity-60" />
              <div className="absolute inset-0 gradient-primary opacity-20 group-hover:opacity-30 transition-opacity whitespace-nowrap" />
              <div className="relative flex flex-col items-center gap-4 text-center z-10">
                <div className="w-16 h-16 rounded-2xl glass border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <span className="text-sm font-semibold text-white px-5 py-2.5 bg-black/60 rounded-full backdrop-blur-md">
                  {firstLesson ? 'Comenzar curso' : 'Próximamente'}
                </span>
              </div>
            </Link>
          )}

          {/* Modules accordion */}
          <div className="pt-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-primary" />
              Contenido del programa
            </h2>
            <div className="flex flex-col gap-3">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm transition-all hover:border-primary/20">
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
          <div className="glass rounded-2xl p-6 flex flex-col gap-6 sticky top-24 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
            
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-foreground">Tu Progreso</span>
                <span className="text-xs font-mono text-primary font-bold">{progressPct}%</span>
              </div>
              <ProgressBar value={progressPct} size="md" />
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest bg-secondary/30 py-2 rounded-lg border border-border/50">
              {completedCount} de {totalLessons} clases finalizadas
            </p>

            {firstLesson ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/learn/${course.slug}?lesson=${firstLesson.id}`}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-primary hover:opacity-95 transition-all active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {completedCount > 0 ? (completedCount === totalLessons ? 'Repasar curso' : 'Continuar aprendiendo') : 'Empezar ahora'}
                </Link>
                {completedCount === totalLessons && totalLessons > 0 && (
                  <Link
                    href={`/courses/${course.slug}/certificate`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-sm hover:bg-amber-500/20 transition-all active:scale-[0.98]"
                  >
                    <Trophy className="w-4 h-4" />
                    Ver Certificado
                  </Link>
                )}
              </div>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-muted-foreground font-semibold text-sm transition-opacity cursor-not-allowed opacity-50 border border-border"
              >
                <BookOpen className="w-4 h-4" />
                Comenzar curso (Próximamente)
              </button>
            )}

            <div className="flex flex-col gap-3 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex justify-between items-center group/item hover:bg-secondary/20 p-1.5 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-primary/60" />
                  Nivel
                </span>
                <span className="text-foreground font-bold">{course.level}</span>
              </div>
              <div className="flex justify-between items-center group/item hover:bg-secondary/20 p-1.5 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  Duración
                </span>
                <span className="text-foreground font-bold">{course.duration || 'Por definir'}</span>
              </div>
              <div className="flex justify-between items-center group/item hover:bg-secondary/20 p-1.5 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary/60" />
                  Instructor
                </span>
                <span className="text-foreground font-bold truncate max-w-[100px]">{course.instructor}</span>
              </div>
            </div>
          </div>

          {/* Related AI Guide */}
          {relatedGuide && (
            <div className="glass rounded-2xl p-5 border border-primary/20 flex flex-col gap-3 relative overflow-hidden group/guide">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl rounded-full" />
              <div className="flex items-center gap-2 relative">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/guide:scale-110 transition-transform">
                  <Zap className="w-4 h-4 text-primary fill-primary/20" />
                </div>
                <span className="text-sm font-bold tracking-tight">ciudadanIA</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{relatedGuide.title}</p>
              <Link
                href={`/ai-guides/${relatedGuide.slug}`}
                className="text-xs text-primary font-bold hover:gap-2 transition-all flex items-center gap-1 mt-1 group-hover/guide:underline underline-offset-4"
              >
                Abrir asistente inteligente
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)
}

function LessonRow({ lesson, courseSlug, completed }: { lesson: Lesson; courseSlug: string; completed: boolean }) {
  return (
    <Link
      href={`/learn/${courseSlug}?lesson=${lesson.id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-primary/5 transition-all group relative overflow-hidden"
    >
      <div className={cn(
        'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300',
        completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-border group-hover:border-primary group-hover:bg-primary/5'
      )}>
        {completed ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Play className="w-2.5 h-2.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
        )}
      </div>
      <span className={cn('text-sm flex-1 leading-snug transition-colors', completed ? 'text-muted-foreground/60' : 'text-foreground/90 font-medium group-hover:text-primary')}>
        {lesson.title}
      </span>
      {lesson.duration && lesson.duration !== '0:00' && (
        <span className="text-[10px] text-muted-foreground/50 shrink-0 font-mono font-bold tracking-tighter">{lesson.duration}</span>
      )}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}
