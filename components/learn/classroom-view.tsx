'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Play, CheckCircle2, Lock, ChevronDown, Download,
  FileText, Link2, Zap, ArrowLeft, BookOpen, X, Loader2, Clock
} from 'lucide-react'
import type { Course, Lesson } from '@/data/courses'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/progress-bar'
import { FeedbackPanel } from '@/components/learn/feedback-panel'
import { submitQuizAttempt } from '@/app/admin/actions'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

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

export function ClassroomView({ course, relatedGuide }: { course: Course; relatedGuide?: RelatedGuide | null }) {
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get('lesson')

  const allLessons = flatLessons(course)
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    allLessons.find((l) => l.id === lessonParam) ?? allLessons[0]
  )
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [videoProgress, setVideoProgress] = useState(0) // 0-100
  const [maxPlayedSeconds, setMaxPlayedSeconds] = useState(0)
  const [tab, setTab] = useState<Tab>('resumen')
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const playerRef = useRef<any>(null)

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
    setMaxPlayedSeconds(0)
    setHasError(false)
    setIsLoading(true)
  }, [currentLesson.id])

  const handleVideoProgress = (state: { played: number, playedSeconds: number }) => {
    // Si la lección ya fue completada, puede navegar libremente
    if (progress[currentLesson.id]) {
      setVideoProgress(state.played * 100)
      return
    }

    // Si adelanta más de 2 segundos de lo que ya vio, lo devolvemos
    if (state.playedSeconds > maxPlayedSeconds + 2) {
      if (playerRef.current) {
        playerRef.current.seekTo(maxPlayedSeconds, 'seconds')
      }
    } else {
      setMaxPlayedSeconds(Math.max(maxPlayedSeconds, state.playedSeconds))
      setVideoProgress(state.played * 100)
    }
  }

  const totalLessons = allLessons.length
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const pdfResource = currentLesson.resources?.find((r: any) => r.type === 'pdf')
  const isPdfOnly = !currentLesson.videoUrl && !!pdfResource

  const canMarkComplete = isPdfOnly || videoProgress >= 95
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
        <div className="flex-1 flex flex-col overflow-y-auto bg-background/50">
          {/* Video / Content Container */}
          <div className="w-full bg-slate-950 aspect-video relative flex items-center justify-center overflow-hidden shadow-2xl">
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
                  <Play className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Esta lección no tiene un video ni PDF configurado.</p>
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
                {currentLesson.videoUrl?.includes('supabase.co') ? (
                  <video
                    src={currentLesson.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    onLoadedData={() => setIsLoading(false)}
                    onError={(e) => {
                      console.error('Native Video Error:', e)
                      setHasError(true)
                      setIsLoading(false)
                    }}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget
                      handleVideoProgress({
                        played: video.currentTime / video.duration,
                        playedSeconds: video.currentTime
                      })
                    }}
                  />
                ) : (
                  <ReactPlayer
                    ref={playerRef}
                    url={currentLesson.videoUrl?.includes('loom.com/share/') ? currentLesson.videoUrl.replace('loom.com/share/', 'loom.com/embed/') : currentLesson.videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    playsinline={true}
                    onReady={() => setIsLoading(false)}
                    onProgress={handleVideoProgress}
                    onError={(e: any) => {
                      console.error('ReactPlayer Error:', e)
                      setHasError(true)
                      setIsLoading(false)
                    }}
                    progressInterval={1000}
                    config={{
                      youtube: {
                        playerVars: { showinfo: 0, rel: 0, modestbranding: 1 }
                      }
                    }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

            {/* Video progress overlay bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 z-10 backdrop-blur-sm">
              <motion.div
                className="h-full gradient-primary glow-primary pointer-events-none"
                initial={{ width: 0 }}
                animate={{ width: `${videoProgress}%` }}
                transition={{ duration: 0.2 }}
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
                {isCompleted ? 'Completada' : isPdfOnly ? 'Completar lectura' : canMarkComplete ? 'Marcar completada' : `Ver hasta el 95% (${Math.round(videoProgress)}%)`}
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
              <FeedbackPanel courseSlug={course.slug} lessonId={currentLesson.id} />
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
                              {lesson.videoUrl && lesson.videoUrl !== '' && (
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
