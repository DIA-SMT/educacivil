'use client'

import { useState, useEffect } from 'react'
import { Star, Send, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackEntry {
  id: string
  rating: number
  comment: string
  date: string
  lessonId: string
}

interface FeedbackPanelProps {
  courseSlug: string
  lessonId: string
}

// TODO: Replace localStorage with API call: POST /api/feedback
function getFeedback(courseSlug: string): FeedbackEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(`feedback:${courseSlug}`) || '[]')
  } catch {
    return []
  }
}

function saveFeedback(courseSlug: string, entries: FeedbackEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`feedback:${courseSlug}`, JSON.stringify(entries))
}

export function FeedbackPanel({ courseSlug, lessonId }: FeedbackPanelProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setEntries(getFeedback(courseSlug))
    setSubmitted(false)
    setRating(0)
    setComment('')
  }, [courseSlug, lessonId])

  const handleSubmit = () => {
    if (rating === 0) return
    const newEntry: FeedbackEntry = {
      id: Date.now().toString(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }),
      lessonId,
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    saveFeedback(courseSlug, updated)
    setSubmitted(true)
    setRating(0)
    setComment('')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      {!submitted ? (
        <div className="glass rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Deja tu valoración
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110"
                aria-label={`${s} estrellas`}
              >
                <Star
                  className={cn(
                    'w-7 h-7 transition-colors',
                    (hovered || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][rating]}
              </span>
            )}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con esta lección (opcional)..."
            rows={3}
            className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 resize-none transition-colors"
          />

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Enviar valoración
          </button>
        </div>
      ) : (
        <div className="glass rounded-xl p-5 text-center flex flex-col items-center gap-3 border border-primary/30">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Star className="w-5 h-5 fill-primary text-primary" />
          </div>
          <p className="font-semibold text-sm">Gracias por tu valoración</p>
          <p className="text-xs text-muted-foreground">Tu feedback ayuda a mejorar el contenido.</p>
          <button onClick={() => setSubmitted(false)} className="text-xs text-primary hover:opacity-80">
            Agregar otra valoración
          </button>
        </div>
      )}

      {/* Existing feedback */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {entries.length} valoracion{entries.length !== 1 ? 'es' : ''}
          </h4>
          {entries.map((entry) => (
            <div key={entry.id} className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn('w-3.5 h-3.5', entry.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              {entry.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
