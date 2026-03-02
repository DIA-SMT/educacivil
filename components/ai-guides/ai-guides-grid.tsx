import Link from 'next/link'
import { Zap, ArrowRight, Bot } from 'lucide-react'
import { aiGuides } from '@/data/courses'

const CATEGORY_COLORS: Record<string, string> = {
  Verificación: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Transparencia: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Gobernanza Digital': 'bg-primary/20 text-primary border-primary/30',
  Democracia: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Participación Ciudadana': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

export function AiGuidesGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Guías de IA
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-balance mb-3">
          Aplica la IA a tu{' '}
          <span className="neon-text">ciudadanía activa</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          Guías prácticas paso a paso con prompts listos para usar en ChatGPT, Claude u otras herramientas de IA. Cada guía te enseña a resolver una tarea ciudadana real.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiGuides.map((guide) => (
          <div
            key={guide.id}
            className="group glass rounded-xl p-6 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[guide.category] ?? 'bg-secondary text-muted-foreground border-border'}`}>
                {guide.category}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {guide.objective}
              </p>
            </div>

            {/* Tools */}
            <div className="flex flex-wrap gap-1.5">
              {guide.tools.map((tool) => (
                <span key={tool} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground font-mono">
                  {tool}
                </span>
              ))}
            </div>

            {/* Steps count + CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">{guide.steps.length} pasos</span>
              <Link
                href={`/ai-guides/${guide.slug}`}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
              >
                Abrir guía
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
