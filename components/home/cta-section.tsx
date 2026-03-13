import Link from 'next/link'
import { ArrowRight, Zap, BookOpen } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative glass rounded-2xl p-10 sm:p-16 text-center overflow-hidden">
          {/* Glow bg */}
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: 'radial-gradient(ellipse at center, oklch(0.72 0.2 210), transparent 70%)' }}
          />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
              Empieza hoy a ser un ciudadano{' '}
              <span className="neon-text">más informado</span>
            </h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed text-pretty">
              Acceso gratuito a todos los cursos y Asistentes ciudadanIA. Sin registro, sin barreras. Solo aprendizaje ciudadano de calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground glow-primary hover:opacity-90 transition-opacity"
              >
                Explorar cursos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai-guides"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              >
                Ver Asistentes ciudadanIA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
