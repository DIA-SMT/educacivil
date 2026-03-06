'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, BookOpen, ChevronDown } from 'lucide-react'
import { SplineScene } from '@/components/ui/spline-scene'
import { Spotlight } from '@/components/ui/spotlight'
import type { Application } from '@splinetool/runtime'

export function HeroSection() {
  const [showSpline, setShowSpline] = useState(true)

  const objectsRef = useRef<{
    head: any;
    head2: any;
    neck: any;
    baseRotations: {
      head: { x: number; y: number; z: number } | null;
      head2: { x: number; y: number; z: number } | null;
      neck: { x: number; y: number; z: number } | null;
    }
  }>({
    head: null,
    head2: null,
    neck: null,
    baseRotations: { head: null, head2: null, neck: null }
  })

  const mouse = useRef({ x: 0, y: 0 })

  // Desmonta el canvas WebGL cuando el hero sale de la vista para liberar GPU
  useEffect(() => {
    const onScroll = () => {
      setShowSpline(window.scrollY < window.innerHeight * 0.9)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSplineLoad(spline: Application) {
    const head = spline.findObjectByName('HEAD');
    const head2 = spline.findObjectByName('HEAD 2');
    const neck = spline.findObjectByName('NECK');

    objectsRef.current.head = head;
    objectsRef.current.head2 = head2;
    objectsRef.current.neck = neck;

    if (head) objectsRef.current.baseRotations.head = { x: head.rotation.x, y: head.rotation.y, z: head.rotation.z };
    if (head2) objectsRef.current.baseRotations.head2 = { x: head2.rotation.x, y: head2.rotation.y, z: head2.rotation.z };
    if (neck) objectsRef.current.baseRotations.neck = { x: neck.rotation.x, y: neck.rotation.y, z: neck.rotation.z };

    // Evitar el scroll automático que Spline provoca al cargar (roba el foco)
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (document.activeElement?.tagName === 'CANVAS') {
        (document.activeElement as HTMLElement).blur();
      }
    }, 10);
  }

  useEffect(() => {
    // Restaurar el scroll a top inmediatamente al montar
    window.scrollTo(0, 0);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouse.current = { x, y };
    }

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number = 0;

    const lerp = (start: number, end: number, t: number) => {
      return start * (1 - t) + end * t;
    }

    const animate = () => {
      const { head, head2, neck, baseRotations } = objectsRef.current;

      // Multiplicador alto para que reaccione bastante con mínimo movimiento (sensibilidad central alta)
      let targetRotationY = mouse.current.x * 2.5;
      let targetRotationX = mouse.current.y * 2.5;

      // Limitar el ángulo máximo para que no gire completamente hacia atrás (ej. max 1.2 radianes)
      const maxAngle = 1.2;
      targetRotationY = Math.max(-maxAngle, Math.min(maxAngle, targetRotationY));
      targetRotationX = Math.max(-maxAngle, Math.min(maxAngle, targetRotationX));

      // Un factor mucho más alto para reaccionar muy rápido y quitar la sensación de lag
      const lerpSpeed = 0.6;

      if (head && baseRotations.head) {
        head.rotation.y = lerp(head.rotation.y, baseRotations.head.y + targetRotationY, lerpSpeed);
        head.rotation.x = lerp(head.rotation.x, baseRotations.head.x + targetRotationX, lerpSpeed);
      }

      if (head2 && baseRotations.head2) {
        head2.rotation.y = lerp(head2.rotation.y, baseRotations.head2.y + targetRotationY, lerpSpeed);
        head2.rotation.x = lerp(head2.rotation.x, baseRotations.head2.x + targetRotationX, lerpSpeed);
      }

      if (neck && baseRotations.neck) {
        neck.rotation.y = lerp(neck.rotation.y, baseRotations.neck.y + (targetRotationY * 0.5), lerpSpeed);
        neck.rotation.x = lerp(neck.rotation.x, baseRotations.neck.x + (targetRotationX * 0.5), lerpSpeed);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Pausa/reanuda el loop de animacion segun si el hero es visible
    const handleScroll = () => {
      const heroVisible = window.scrollY < window.innerHeight;
      if (!heroVisible && animationFrameId !== 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      } else if (heroVisible && animationFrameId === 0) {
        animate();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    }
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.72 0.2 210)"
      />

      {/* Spline 3D background — desmontado al scrollear para liberar GPU */}
      <div className="absolute inset-0 z-0">
        {showSpline && (
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={handleSplineLoad}
          />
        )}
        {/* Overlay to keep text readable */}
        <div className="absolute inset-0 bg-background/40 pointer-events-none md:bg-background/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center text-center gap-8 pointer-events-none">
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
        <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
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
