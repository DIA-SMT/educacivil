'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Play, CheckCircle2, Lock, ChevronDown, Download,
  FileText, Link2, Zap, ArrowLeft, BookOpen, X, Loader2, Clock,
  Maximize, Volume2, VolumeX, Pause
} from 'lucide-react'
import type { Course, Lesson } from '@/data/courses'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/progress-bar'
import { FeedbackPanel } from '@/components/learn/feedback-panel'
import { CourseCompletionModal } from '@/components/learn/course-completion-modal'
import { submitQuizAttempt } from '@/app/admin/actions'
import { getLessonProgress, markLessonComplete } from '@/app/learn/actions'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { getVideoKind, normalizeVideoUrl, getIframeEmbedUrl } from '@/lib/video'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any



function flatLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons)
}

/** Segundos -> "m:ss" (o "h:mm:ss" en videos largos). */
function formatClock(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

type Tab = 'resumen' | 'recursos' | 'cuestionario' | 'devoluciones'

interface RelatedGuide {
  slug: string
  title: string
}

// ================================================================
// Quiz Player Component
// ================================================================
function QuizPlayer({ quiz, onComplete }: { quiz: any, onComplete: (score: number, answers: any) => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const questions = quiz.quiz_questions || []
  const currentQuestion = questions[currentQuestionIndex]

  const handleSelectOption = (optionIndex: number) => {
    if (showResults) return
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: optionIndex })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateResults()
    }
  }

  const calculateResults = () => {
    let correctCount = 0
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correct_option_index) {
        correctCount++
      }
    })
    const finalScore = Math.round((correctCount / questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)
    onComplete(finalScore, selectedAnswers)
  }

  if (questions.length === 0) return <div className="p-8 text-center text-muted-foreground">Este cuestionario no tiene preguntas aún.</div>

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl border border-primary/20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
            <span className="text-3xl font-bold text-primary">{score}%</span>
          </div>
          <h2 className="text-2xl font-bold">¡Cuestionario Completado!</h2>
          <p className="text-muted-foreground">Has obtenido una nota de {score} sobre 100.</p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setShowResults(false)
            setCurrentQuestionIndex(0)
            setSelectedAnswers({})
          }}> Reintentar </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Revisión de respuestas:</h3>
          {questions.map((q: any, idx: number) => {
            const isCorrect = selectedAnswers[q.id] === q.correct_option_index
            return (
              <div key={q.id} className={cn("p-4 rounded-xl border transition-all", isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20")}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pregunta {idx + 1}</span>
                  {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-500" />}
                </div>
                <p className="font-medium mb-3">{q.question_text}</p>
                <div className="grid gap-2">
                  {q.options.map((opt: string, oIdx: number) => {
                    const isSelected = selectedAnswers[q.id] === oIdx
                    const isCorrectOption = q.correct_option_index === oIdx
                    return (
                      <div 
                        key={oIdx} 
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm border flex items-center justify-between",
                          isCorrectOption ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : isSelected ? "bg-red-500/10 border-red-500/30 text-red-600" : "bg-secondary/50 border-border text-muted-foreground"
                        )}
                      >
                        {opt}
                        {isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isSelected && !isCorrectOption && <X className="w-3.5 h-3.5" />}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground italic">
                    <strong>Explicación:</strong> {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
        <div className="flex-1 h-1.5 bg-secondary mx-4 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary glow-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold leading-tight">{currentQuestion.question_text}</h2>

      <div className="grid gap-3 pt-4">
        {currentQuestion.options.map((option: string, idx: number) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(idx)}
            className={cn(
              "w-full p-4 rounded-xl border text-left transition-all duration-200 group relative",
              selectedAnswers[currentQuestion.id] === idx 
                ? "bg-primary border-primary text-primary-foreground shadow-lg glow-primary" 
                : "bg-card border-border hover:border-primary/50 hover:bg-secondary/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                selectedAnswers[currentQuestion.id] === idx ? "bg-white/20 border-white/30" : "bg-secondary border-border group-hover:border-primary/30"
              )}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-sm sm:text-base font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion.id] === undefined}
          className="px-8 gap-2"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Cuestionario'}
        </Button>
      </div>
    </div>
  )
}

function Button({ children, onClick, disabled, variant = 'primary', className = '' }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-6 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20',
        variant === 'primary' 
          ? 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed glow-primary' 
          : 'bg-secondary text-foreground hover:bg-secondary/70',
        className
      )}
    >
      {children}
    </button>
  )
}

interface ClassroomViewProps {
  course: Course
  relatedGuide?: RelatedGuide | null
  initialFeedback?: any[]
}

export function ClassroomView({ course, relatedGuide, initialFeedback = [] }: ClassroomViewProps) {
  const allLessons = flatLessons(course)

  // Un curso publicado sin lecciones cargadas rompía el aula (currentLesson
  // quedaba undefined). Mostramos un aviso en vez de tirar la pantalla abajo.
  if (allLessons.length === 0) {
    return <EmptyClassroom course={course} />
  }

  return <Classroom course={course} relatedGuide={relatedGuide} initialFeedback={initialFeedback} />
}

function EmptyClassroom({ course }: { course: Course }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-xl font-bold">{course.title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Este curso todavía no tiene lecciones publicadas. Volvé en unos días.
      </p>
      <Link
        href={`/courses/${course.slug}`}
        className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Volver al curso
      </Link>
    </div>
  )
}

function Classroom({ course, relatedGuide, initialFeedback = [] }: ClassroomViewProps) {
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')

  const allLessons = flatLessons(course)
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    allLessons.find((l) => l.id === lessonParam) ?? allLessons[0]
  )
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [videoProgress, setVideoProgress] = useState(0) // 0-100
  const [maxPlayedSeconds, setMaxPlayedSeconds] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [currentSec, setCurrentSec] = useState(0)
  const [tab, setTab] = useState<Tab>('resumen')
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const playerRef = useRef<any>(null)
  const nativeVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    // Load progress from Supabase
    getLessonProgress(course.slug).then(setProgress)
    // Open all modules by default
    const initial: Record<string, boolean> = {}
    course.modules.forEach((m) => { initial[m.id] = true })
    setOpenModules(initial)
  }, [course.slug])

  useEffect(() => {
    // Reset video progress when lesson changes
    setVideoProgress(0)
    setMaxPlayedSeconds(0)
    setDurationSec(0)
    setCurrentSec(0)
    setHasError(false)
    setIsLoading(true)
    setIsPlaying(false)

    // Fallback: hide loader after 2s for embeds (YouTube/Vimeo/etc.)
    // where loadeddata/loadstart events are unreliable.
    const isEmbed = !!currentLesson.videoUrl && getVideoKind(currentLesson.videoUrl) !== 'file'
    if (!isEmbed) return
    const t = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(t)
  }, [currentLesson.id])

  // Sync playing state for native video
  useEffect(() => {
    if (nativeVideoRef.current && !progress[currentLesson.id]) {
      if (isPlaying) {
        nativeVideoRef.current.play().catch(console.error)
      } else {
        nativeVideoRef.current.pause()
      }
    }
  }, [isPlaying, progress, currentLesson.id])

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handleVideoProgress = (state: { played: number, playedSeconds: number, duration?: number }) => {
    if (state.duration && state.duration !== durationSec) setDurationSec(state.duration)
    setCurrentSec(state.playedSeconds)

    // Si la lección ya fue completada, puede navegar libremente
    if (progress[currentLesson.id]) {
      setVideoProgress(state.played * 100)
      return
    }

    // Si adelanta más de 2 segundos de lo que ya vio, lo devolvemos
    if (state.playedSeconds > maxPlayedSeconds + 2) {
      if (playerRef.current) {
        playerRef.current.currentTime = maxPlayedSeconds
      } else if (nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = maxPlayedSeconds
      }
    } else {
      setMaxPlayedSeconds(Math.max(maxPlayedSeconds, state.playedSeconds))
      setVideoProgress(state.played * 100)
    }
  }

  /** Mueve la reproducción. En lecciones sin completar no deja pasar de lo ya visto. */
  const seekTo = (seconds: number) => {
    const done = !!progress[currentLesson.id]
    const limit = done ? durationSec : Math.min(maxPlayedSeconds, durationSec)
    const target = Math.max(0, Math.min(seconds, limit || seconds))
    const el = playerRef.current ?? nativeVideoRef.current
    if (el) {
      el.currentTime = target
      setCurrentSec(target)
      if (durationSec > 0) setVideoProgress((target / durationSec) * 100)
    }
  }

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!durationSec) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seekTo(ratio * durationSec)
  }

  const totalLessons = allLessons.length
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Show completion modal when all lessons are done
  useEffect(() => {
    if (totalLessons > 0 && completedCount === totalLessons) {
      const timer = setTimeout(() => setShowCompletionModal(true), 600)
      return () => clearTimeout(timer)
    }
  }, [completedCount, totalLessons])

  const pdfResource = currentLesson.resources?.find((r: any) => r.type === 'pdf')
  // Una lección sin video se completa leyendo/descargando el material. Antes se
  // exigía que además tuviera un recurso tipo 'pdf': si no lo tenía, el botón
  // de completar no se habilitaba NUNCA, y eso trababa el curso entero y con él
  // el certificado.
  const hasVideo = !!currentLesson.videoUrl
  const isPdfOnly = !hasVideo && !!pdfResource

  // Cómo se reproduce esta lección:
  //  - 'file'          -> <video> nativo (subida a Supabase Storage o .mp4 suelto)
  //  - youtube/vimeo   -> react-player (los únicos proveedores que soporta la v3)
  //  - loom/drive      -> <iframe> propio; react-player los degradaba a un
  //                       <video> con una página HTML adentro, o sea un cuadro negro
  const videoKind = getVideoKind(currentLesson.videoUrl)
  const playerSrc = normalizeVideoUrl(currentLesson.videoUrl)
  const iframeEmbedUrl = currentLesson.videoUrl ? getIframeEmbedUrl(currentLesson.videoUrl) : null
  const usesReactPlayer = videoKind === 'youtube' || videoKind === 'vimeo'
  // Sólo podemos medir el avance en el <video> nativo y en YouTube/Vimeo. En un
  // iframe de terceros o con un enlace que no reconocemos no hay señal alguna,
  // así que exigir el 95% dejaría la lección sin salida y trabaría el curso.
  const isTrackable = usesReactPlayer || videoKind === 'file'

  const canMarkComplete = !hasVideo || !isTrackable || hasError || videoProgress >= 95
  const isCompleted = !!progress[currentLesson.id]

  const handleMarkComplete = useCallback(() => {
    // Optimistic update
    const updated = { ...progress, [currentLesson.id]: true }
    setProgress(updated)

    // Persist to Supabase
    startTransition(async () => {
      await markLessonComplete(course.slug, currentLesson.id)
    })

    // Auto-advance to next lesson
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id)
    if (idx < allLessons.length - 1) {
      setTimeout(() => setCurrentLesson(allLessons[idx + 1]), 400)
    }
  }, [progress, currentLesson.id, allLessons, course.slug, startTransition])

  const isLessonUnlocked = useCallback((lesson: Lesson): boolean => {
    const idx = allLessons.findIndex((l) => l.id === lesson.id)
    if (idx === 0) return true
    const prev = allLessons[idx - 1]
    return !!progress[prev.id]
  }, [allLessons, progress])

  // relatedGuide is passed as a prop from the server page

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showCompletionModal && (
        <CourseCompletionModal
          courseSlug={course.slug}
          courseTitle={course.title}
          totalLessons={totalLessons}
        />
      )}
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
        <div className="flex-1 flex flex-col overflow-y-auto bg-background/50">
          {/* Video / Content Container */}
          <div ref={containerRef} className="w-full bg-slate-950 aspect-video relative flex items-center justify-center overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative flex items-center justify-center"
              >
            {!currentLesson.videoUrl ? (
              isPdfOnly ? (
                <div className="w-full h-full bg-secondary/20 flex flex-col items-center justify-center p-8 text-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Contenido en PDF</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Esta lección consiste en un material de lectura en formato PDF. 
                      Puedes previsualizarlo o descargarlo para completar la lección.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <a 
                      href={pdfResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg glow-primary"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground p-8 text-center">
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p className="text-sm max-w-md">
                    Esta lección es de lectura: revisá el resumen y los materiales
                    de la pestaña <strong>Recursos</strong>, y marcala como completada.
                  </p>
                </div>
              )
            ) : hasError ? (
              <div className="flex flex-col items-center gap-3 text-destructive p-8 text-center bg-destructive/5 w-full h-full justify-center">
                <X className="w-12 h-12" />
                <p className="text-sm font-semibold">Error al cargar el video</p>
                <p className="text-xs opacity-70">Asegúrate de que el enlace sea válido o prueba refrescar.</p>
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => setHasError(false)}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    Reintentar
                  </button>
                  <a 
                    href={currentLesson.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 text-xs underline hover:no-underline text-primary"
                  >
                    Abrir video directamente
                  </a>
                </div>
              </div>
            ) : (
              <>
                {isLoading && !hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 z-20 transition-opacity">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-xs text-white/70 font-medium">Cargando video...</p>
                  </div>
                )}
                {videoKind === 'file' ? (
                  <video
                    ref={nativeVideoRef}
                    src={currentLesson.videoUrl}
                    className="w-full h-full object-contain"
                    controls={isCompleted}
                    playsInline
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => setIsLoading(false)}
                    onDurationChange={(e) => {
                      const d = e.currentTarget.duration
                      if (d && isFinite(d)) setDurationSec(d)
                    }}
                    onError={(e) => {
                      console.error('Native Video Error:', e)
                      setHasError(true)
                      setIsLoading(false)
                    }}
                    onSeeking={(e) => {
                      const video = e.currentTarget
                      if (!progress[currentLesson.id] && video.currentTime > maxPlayedSeconds + 2) {
                        video.currentTime = maxPlayedSeconds
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget
                      handleVideoProgress({
                        played: video.currentTime / video.duration,
                        playedSeconds: video.currentTime,
                        duration: video.duration,
                      })
                    }}
                  />
                ) : iframeEmbedUrl ? (
                  <iframe
                    src={iframeEmbedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentLesson.title}
                    onLoad={() => setIsLoading(false)}
                  />
                ) : !usesReactPlayer ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground p-8 text-center">
                    <Play className="w-12 h-12 opacity-20" />
                    <p className="text-sm">No pudimos reconocer el enlace de este video.</p>
                    <a
                      href={currentLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline hover:no-underline text-primary"
                    >
                      Abrirlo en una pestaña nueva
                    </a>
                  </div>
                ) : (
                  <ReactPlayer
                    ref={playerRef}
                    src={playerSrc}
                    width="100%"
                    height="100%"
                    // Nunca mostramos los controles nativos de YouTube: su barra
                    // trae "Compartir"/"Copiar enlace" y "Ver en YouTube", que
                    // sacan al vecino de la plataforma. Usamos los propios.
                    controls={false}
                    playing={isPlaying}
                    muted={isMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onReady={() => setIsLoading(false)}
                    onLoadedData={() => setIsLoading(false)}
                    // La duración se conoce apenas carga la metadata, antes de
                    // que empiece a reproducirse: sin esto la barra de progreso
                    // arranca sin escala y no se puede clickear.
                    onDurationChange={(e: any) => {
                      const d = e.currentTarget?.duration
                      if (d && isFinite(d)) setDurationSec(d)
                    }}
                    onSeeking={(e: any) => {
                      const t = e.currentTarget?.currentTime ?? 0
                      if (!progress[currentLesson.id] && t > maxPlayedSeconds + 2) {
                        if (playerRef.current) playerRef.current.currentTime = maxPlayedSeconds
                      }
                    }}
                    onTimeUpdate={(e: any) => {
                      const el = e.currentTarget
                      if (!el?.duration) return
                      handleVideoProgress({
                        played: el.currentTime / el.duration,
                        playedSeconds: el.currentTime,
                        duration: el.duration,
                      })
                    }}
                    onError={(e: any) => {
                      console.error('ReactPlayer Error:', e)
                      setHasError(true)
                      setIsLoading(false)
                    }}
                    // Nota: el prop `config` de react-player v3 llega al custom
                    // element DESPUÉS de que este ya armó la URL del iframe, así
                    // que no tiene efecto (verificado sobre el iframe renderizado).
                    // Por suerte los defaults de youtube-video-element ya son los
                    // que queríamos: rel=0, modestbranding=1, iv_load_policy=3.
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

            {/* Controles propios. Van SIEMPRE (también en lecciones completadas):
                si le cedemos la interfaz a YouTube, su barra muestra
                "Compartir / Copiar enlace" y "Ver en YouTube" y el vecino se va
                de la plataforma. En embeds de terceros (Loom/Drive) no se
                muestran porque no podemos controlar la reproducción. */}
            {!isPdfOnly && isTrackable && currentLesson.videoUrl && !hasError && (
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {/* Centered Play Button when Paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all">
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-2xl glow-primary scale-100 transition-transform hover:scale-110">
                      <Play className="w-10 h-10 ml-2 fill-current" />
                    </div>
                  </div>
                )}

                {/* Control bar at the bottom */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end px-6 pb-3 pt-8 transition-opacity duration-300",
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Barra de progreso propia. En lecciones sin completar sólo
                      deja moverse dentro de lo ya visto. */}
                  <div
                    onClick={handleSeekBarClick}
                    className="group/seek relative h-4 flex items-center cursor-pointer mb-1"
                    role="slider"
                    aria-label="Progreso del video"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(durationSec)}
                    aria-valuenow={Math.round(currentSec)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(currentSec + 5) }
                      if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(currentSec - 5) }
                    }}
                  >
                    <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                      {/* Zona ya vista (hasta dónde puede volver) */}
                      {!isCompleted && durationSec > 0 && (
                        <div
                          className="absolute h-1 bg-white/40 rounded-full"
                          style={{ width: `${Math.min(100, (maxPlayedSeconds / durationSec) * 100)}%` }}
                        />
                      )}
                      <div
                        className="relative h-1 gradient-primary rounded-full"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <div
                      className="absolute w-3 h-3 rounded-full bg-primary shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
                      style={{ left: `${videoProgress}%` }}
                    />
                  </div>

                  <div className="flex items-end justify-between">
                  <div className="flex gap-6 items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                      aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                      className="text-white hover:text-primary transition-colors focus:outline-none"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                      aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                      className="text-white hover:text-primary transition-colors focus:outline-none"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>

                    <div className="text-white/80 text-xs font-medium tabular-nums">
                      {durationSec > 0
                        ? `${formatClock(currentSec)} / ${formatClock(durationSec)}`
                        : `${Math.round(videoProgress)}% completado`}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={toggleFullscreen}
                      aria-label="Pantalla completa"
                      className="text-white hover:text-primary transition-colors focus:outline-none"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Barra fina de avance, siempre visible aunque los controles estén
                ocultos. Sólo cuando NO hay controles propios (embeds de terceros). */}
            {!isTrackable && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 z-10 backdrop-blur-sm">
                <motion.div
                  className="h-full gradient-primary glow-primary pointer-events-none"
                  initial={{ width: 0 }}
                  animate={{ width: `${videoProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
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
                {isCompleted
                  ? 'Completada'
                  : isPdfOnly
                    ? 'Completar lectura'
                    : canMarkComplete
                      ? 'Marcar completada'
                      : `Ver hasta el 95% (${Math.round(videoProgress)}%)`}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border/50 mb-8 relative">
              {['resumen', 'recursos', currentLesson.quiz && 'cuestionario', 'devoluciones'].filter(Boolean).map((t) => (
                <button
                  key={t as string}
                  onClick={() => setTab(t as Tab)}
                  className={cn(
                    'px-6 py-3 text-sm font-semibold capitalize transition-all relative z-10',
                    tab === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'devoluciones' ? 'Devoluciones' : t === 'cuestionario' ? 'Cuestionario' : (t as string).charAt(0).toUpperCase() + (t as string).slice(1)}
                  {currentLesson.quiz && t === 'cuestionario' && !isCompleted && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary glow-primary animate-pulse" />
                  )}
                  {tab === t && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-primary"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
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
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{res.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold bg-secondary/50 px-1.5 py-0.5 rounded inline-block">{res.type}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                          <Download className="w-4 h-4" />
                        </div>
                      </a>
                    )
                  })
                )}
              </div>
            )}

            {tab === 'cuestionario' && currentLesson.quiz && (
              <QuizPlayer 
                quiz={currentLesson.quiz} 
                onComplete={(score, answers) => {
                  submitQuizAttempt(currentLesson.quiz!.id, score, answers)
                  // If score is good, we could mark complete automatically
                  if (score >= 60) {
                    handleMarkComplete()
                  }
                }} 
              />
            )}

            {tab === 'devoluciones' && (
              <FeedbackPanel
                courseSlug={course.slug}
                lessonId={currentLesson.id}
                initialEntries={initialFeedback}
              />
            )}
          </div>
        </div>

        {/* Playlist sidebar */}
        <aside className="hidden lg:flex flex-col w-84 border-l border-border/50 overflow-y-auto glass-strong">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Contenido del Curso
            </h2>
            <ProgressBar value={progressPct} className="mt-4" size="sm" showLabel />
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
                            'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300',
                            completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : active ? 'border-primary bg-primary/10' : 'border-border'
                          )}>
                            {completed ? (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : !unlocked ? (
                              <Lock className="w-3 h-3 text-muted-foreground/50" />
                            ) : (
                              <Play className={cn("w-2.5 h-2.5", active ? "text-primary fill-primary" : "text-muted-foreground")} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs leading-snug tracking-tight transition-colors', active ? 'text-primary font-bold' : 'text-foreground/80 font-medium')}>{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {lesson.duration && lesson.duration !== '0:00' && (
                                <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {lesson.duration}
                                </span>
                              )}
                              {lesson.resources?.length > 0 && (
                                <span className="text-[10px] text-primary/60 font-medium flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5" />
                                  {lesson.resources.length}
                                </span>
                              )}
                            </div>
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
