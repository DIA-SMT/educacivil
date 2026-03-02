'use client'

import Link from 'next/link'
import { ArrowRight, Zap, BookOpen, ChevronDown } from 'lucide-react'
import { SplineScene } from '@/components/ui/spline-scene'
import { Spotlight } from '@/components/ui/spotlight'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.72 0.2 210)"
      />

      {/* Spline 3D background — positioned right half, full height */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
        {/* Overlay to keep text readable */}
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center text-center gap-8">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-sm text-primary font-medium">
          <Zap className="w-3.5 h-3.5" />
          Plataforma de Formación Ciudadana con IA
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-balance max-w-5xl leading-tight">
          Ciudadanía activa para{' '}
          <span className="neon-text">el mundo</span>{' '}
          <span className="neon-text-cyan">digital</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          Aprende democracia, derechos humanos y gobernanza con cursos interactivos, guías de IA y herramientas para ser un ciudadano más informado y efectivo.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/courses"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground glow-primary hover:opacity-90 transition-all duration-200 text-base"
          >
            <BookOpen className="w-5 h-5" />
            Explorar cursos
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-guides"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-all duration-200 text-base"
          >
            <Zap className="w-5 h-5" />
            Ver guías IA
          </Link>
          <Link
            href="/#como-funciona"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors text-base"
          >
            Cómo funciona
            <ChevronDown className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-border w-full max-w-2xl">
          {[
            { value: '6+', label: 'Cursos disponibles' },
            { value: '5', label: 'Guías de IA' },
            { value: '12K+', label: 'Estudiantes activos' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-bold neon-text">{stat.value}</span>
              <span className="text-xs sm:text-sm text-muted-foreground text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </div>
    </section>
  )
}
