'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Zap, Copy, Check, ChevronRight, BookOpen } from 'lucide-react'
import type { AiGuide } from '@/data/courses'
import { courses } from '@/data/courses'
import { cn } from '@/lib/utils'

interface AiGuideDocumentProps {
  guide: AiGuide
}

export function AiGuideDocument({ guide }: AiGuideDocumentProps) {
  const [copied, setCopied] = useState(false)
  const relatedCourse = guide.relatedCourseSlug ? courses.find((c) => c.slug === guide.relatedCourseSlug) : null

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(guide.suggestedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/ai-guides" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Asistentes ciudadanIA
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{guide.title}</span>
      </div>

      {/* Doc header */}
      <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.2 210), transparent 70%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs text-primary font-medium uppercase tracking-wider">{guide.category}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance leading-tight">{guide.title}</h1>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{guide.objective}</p>

          {/* Tools */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Herramientas:</span>
            {guide.tools.map((tool) => (
              <span key={tool} className="px-2.5 py-1 rounded-full bg-secondary text-xs font-mono text-foreground border border-border">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Steps */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-bold">Pasos a seguir</h2>
          <div className="flex flex-col gap-4">
            {guide.steps.map((step, idx) => (
              <div
                key={step.step}
                className={cn(
                  'flex gap-4 p-5 rounded-xl border transition-all duration-200',
                  'glass hover:border-primary/30'
                )}
              >
                <div className="shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt section */}
          {guide.suggestedPrompt && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Prompt sugerido</h2>
                <button
                  onClick={copyPrompt}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-secondary text-muted-foreground hover:text-foreground border border-border hover:border-primary/40'
                  )}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar prompt'}
                </button>
              </div>
              <div className="relative rounded-xl border border-primary/20 bg-secondary/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px gradient-primary opacity-40" />
                <div className="p-5 font-mono text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {guide.suggestedPrompt}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Copia este prompt y pégalo en ChatGPT, Claude u otra herramienta de IA. Reemplaza los textos entre corchetes con tu información específica.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Summary card */}
          <div className="glass rounded-xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm">Resumen del asistente</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría</span>
                <span className="text-foreground font-medium">{guide.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pasos</span>
                <span className="text-foreground font-medium">{guide.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Herramientas</span>
                <span className="text-foreground font-medium">{guide.tools.length}</span>
              </div>
            </div>
          </div>

          {/* Related course */}
          {relatedCourse && (
            <div className="glass rounded-xl p-5 flex flex-col gap-3 border border-primary/20">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Curso relacionado</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{relatedCourse.title}</p>
              <Link
                href={`/courses/${relatedCourse.slug}`}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:opacity-80 transition-opacity"
              >
                Ver curso
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* All guides link */}
          <Link
            href="/ai-guides"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <Zap className="w-4 h-4" />
            Ver todos los asistentes
          </Link>
        </div>
      </div>
    </div>
  )
}
