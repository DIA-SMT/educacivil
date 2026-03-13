'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Play, CheckCircle2, Lock, ChevronDown, Download,
  FileText, Link2, Zap, ArrowLeft, BookOpen
} from 'lucide-react'
import type { Course, Lesson } from '@/data/courses'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/progress-bar'
import { FeedbackPanel } from '@/components/learn/feedback-panel'

// ================================================================
// Progress helpers — stored in localStorage
// TODO: Replace with API calls: GET/PUT /api/progress/:courseSlug
// ================================================================
function getProgress(courseSlug: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(`progress:${courseSlug}`) || '{}')
  } catch {
    return {}
  }
}

function saveProgress(courseSlug: string, data: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`progress:${courseSlug}`, JSON.stringify(data))
}

function flatLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons)
}

type Tab = 'resumen' | 'recursos' | 'devoluciones'

interface RelatedGuide {
  slug: string
  title: string
}

export function ClassroomView({ course, relatedGuide }: { course: Course; relatedGuide?: RelatedGuide | null }) {
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')

  const allLessons = flatLessons(course)
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    allLessons.find((l) => l.id === lessonParam) ?? allLessons[0]
  )
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [videoProgress, setVideoProgress] = useState(0) // 0-100
  const [tab, setTab] = useState<Tab>('resumen')
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Simulated video progress — in production replace with real video events
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setProgress(getProgress(course.slug))
    // Open all modules by default
    const initial: Record<string, boolean> = {}
    course.modules.forEach((m) => { initial[m.id] = true })
    setOpenModules(initial)
  }, [course.slug])

  useEffect(() => {
    // Reset video progress when lesson changes
    setVideoProgress(0)
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Simulate video progress (demo mode)
    intervalRef.current = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 100
        }
        return prev + 0.5
      })
    }, 800)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [currentLesson.id])

  const totalLessons = allLessons.length
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const canMarkComplete = videoProgress >= 95
  const isCompleted = !!progress[currentLesson.id]

  const handleMarkComplete = useCallback(() => {
    const updated = { ...progress, [currentLesson.id]: true }
    setProgress(updated)
    saveProgress(course.slug, updated)

    // Auto-advance to next lesson
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id)
    if (idx < allLessons.length - 1) {
      setTimeout(() => setCurrentLesson(allLessons[idx + 1]), 400)
    }
  }, [progress, currentLesson.id, allLessons, course.slug])

  const isLessonUnlocked = useCallback((lesson: Lesson): boolean => {
    const idx = allLessons.findIndex((l) => l.id === lesson.id)
    if (idx === 0) return true
    const prev = allLessons[idx - 1]
    return !!progress[prev.id]
  }, [allLessons, progress])

  // relatedGuide is passed as a prop from the server page

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="glass-strong border-b border-border px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href={`/courses/${course.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{course.title}</span>
        </Link>
        <div className="flex-1 mx-4">
          <ProgressBar value={progressPct} size="sm" />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{completedCount}/{totalLessons}</span>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video + content area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video */}
          <div className="w-full bg-black aspect-video relative">
            <iframe
              ref={iframeRef}
              src={currentLesson.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentLesson.title}
            />
            {/* Video progress overlay bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          </div>

          {/* Below video */}
          <div className="p-5 sm:p-8 max-w-4xl">
            {/* Title + Complete btn */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug">{currentLesson.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.modules.find((m) => m.lessons.some((l) => l.id === currentLesson.id))?.title}
                </p>
              </div>
              <button
                onClick={handleMarkComplete}
                disabled={!canMarkComplete || isCompleted}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all duration-200',
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : canMarkComplete
                      ? 'bg-primary text-primary-foreground glow-primary hover:opacity-90'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Completada' : canMarkComplete ? 'Marcar completada' : `Ver hasta el 95% (${Math.round(videoProgress)}%)`}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6">
              {(['resumen', 'recursos', 'devoluciones'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                    tab === t
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'devoluciones' ? 'Devoluciones' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'resumen' && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>{currentLesson.description}</p>
                {relatedGuide && (
                  <div className="mt-6 glass rounded-xl p-4 flex items-start gap-3 border border-primary/20">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">Asistente ciudadanIA relacionado</p>
                      <p className="text-xs text-muted-foreground mb-2">{relatedGuide.title}</p>
                      <Link href={`/ai-guides/${relatedGuide.slug}`} className="text-xs text-primary hover:opacity-80 font-medium">
                        Abrir asistente
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'recursos' && (
              <div className="flex flex-col gap-3">
                {currentLesson.resources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay recursos descargables para esta lección.</p>
                ) : (
                  currentLesson.resources.map((res) => {
                    const Icon = res.type === 'link' ? Link2 : FileText
                    return (
                      <a
                        key={res.id}
                        href={res.url}
                        download={res.type !== 'link'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{res.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{res.type}</p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    )
                  })
                )}
              </div>
            )}

            {tab === 'devoluciones' && (
              <FeedbackPanel courseSlug={course.slug} lessonId={currentLesson.id} />
            )}
          </div>
        </div>

        {/* Playlist sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-border overflow-y-auto bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Lecciones del curso
            </h2>
            <ProgressBar value={progressPct} className="mt-2" size="sm" showLabel />
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module) => (
              <div key={module.id}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
                  onClick={() => setOpenModules((p) => ({ ...p, [module.id]: !p[module.id] }))}
                >
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{module.title}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', openModules[module.id] && 'rotate-180')} />
                </button>

                {openModules[module.id] && (
                  <div>
                    {module.lessons.map((lesson) => {
                      const completed = !!progress[lesson.id]
                      const unlocked = isLessonUnlocked(lesson)
                      const active = lesson.id === currentLesson.id

                      return (
                        <button
                          key={lesson.id}
                          disabled={!unlocked}
                          onClick={() => unlocked && setCurrentLesson(lesson)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                            active ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-secondary/40 border-l-2 border-transparent',
                            !unlocked && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                            completed ? 'bg-primary border-primary' : active ? 'border-primary' : 'border-border'
                          )}>
                            {completed ? (
                              <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : !unlocked ? (
                              <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                            ) : (
                              <Play className="w-2 h-2 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs leading-snug truncate', active ? 'text-primary font-medium' : 'text-foreground')}>{lesson.title}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{lesson.duration}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
