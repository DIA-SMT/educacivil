'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitCourseReview } from '@/app/learn/actions'

interface CourseCompletionModalProps {
  courseSlug: string
  courseTitle: string
  totalLessons: number
}

export function CourseCompletionModal({
  courseSlug,
  courseTitle,
  totalLessons,
}: CourseCompletionModalProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const ratingLabels = ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', '¡Excelente!']

  const handleSubmitAndRedirect = () => {
    startTransition(async () => {
      if (rating > 0) {
        const result = await submitCourseReview(courseSlug, rating, review)
        if (result.error) {
          setError(result.error)
          return
        }
        setSubmitted(true)
      } else {
        router.push(`/courses/${courseSlug}`)
      }
    })
  }

  const handleSkip = () => {
    router.push(`/courses/${courseSlug}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/5 pointer-events-none" />

          {/* Animated dots decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary animate-pulse" />

          <div className="relative p-8 flex flex-col items-center gap-6 text-center">
            {/* Trophy icon with pulse rings */}
            <div className="relative mt-2">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/20 border-2 border-primary/40 flex items-center justify-center shadow-xl">
                <Trophy className="w-12 h-12 text-primary drop-shadow-lg" />
              </div>

              {/* Floating stars */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-amber-400"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI * 2) / 6) * 55],
                    y: [0, Math.sin((i * Math.PI * 2) / 6) * 55],
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">¡Curso completado!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Terminaste{' '}
                <span className="text-foreground font-semibold">{courseTitle}</span>
                {' '}con {totalLessons} {totalLessons === 1 ? 'lección' : 'lecciones'} completadas.
              </p>
            </div>

            {/* Review section */}
            {!submitted ? (
              <div className="w-full space-y-4">
                <p className="text-sm font-semibold text-foreground">
                  ¿Qué te pareció el curso?
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-125 active:scale-95"
                      aria-label={`${s} estrellas`}
                    >
                      <Star
                        className={cn(
                          'w-9 h-9 transition-all duration-150',
                          (hovered || rating) >= s
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'text-muted-foreground/40'
                        )}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold text-amber-400"
                  >
                    {ratingLabels[rating]}
                  </motion.p>
                )}

                {/* Review textarea */}
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Contanos qué aprendiste o qué mejorarías (opcional)..."
                  rows={3}
                  className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 resize-none transition-colors"
                />

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                {/* CTA buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleSubmitAndRedirect}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/20"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {rating > 0 ? 'Enviar reseña' : 'Volver al curso'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/courses/${courseSlug}/certificate`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/70 transition-colors"
                  >
                    Ver mi Certificado
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <p className="text-sm font-semibold text-emerald-400">¡Gracias por tu reseña!</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push(`/courses/${courseSlug}/certificate`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                  >
                    Ver mi Certificado
                  </button>
                  <button
                    onClick={handleSkip}
                    className="flex items-center justify-center gap-2 mx-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Volver al curso <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
