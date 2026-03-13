'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: '¿Necesito conocimientos previos para empezar?',
    a: 'No. La mayoría de nuestros cursos tienen niveles desde principiante. Cada curso indica el nivel requerido en su descripción para que puedas elegir el más adecuado para ti.',
  },
  {
    q: '¿Necesito crear una cuenta para acceder?',
    a: 'En esta etapa la plataforma funciona en modo público. Puedes explorar todos los cursos y Asistentes ciudadanIA sin registro. Próximamente habilitaremos cuentas para guardar certificados y progreso en la nube.',
  },
  {
    q: '¿Cómo se guarda mi progreso?',
    a: 'Tu avance en los cursos se guarda automáticamente en tu navegador (localStorage). Esto significa que si cambias de dispositivo, el progreso no se transfiere por ahora. Pronto tendremos sincronización en la nube.',
  },
  {
    q: '¿Qué son los Asistentes ciudadanIA?',
    a: 'Son recursos paso a paso diseñados para que aproveches herramientas como ChatGPT o Claude en tareas ciudadanas reales (como analizar un presupuesto o reportar un problema), sin necesidad de tener experiencia técnica.',
  },
  {
    q: '¿Los certificados son reconocidos oficialmente?',
    a: 'Actualmente los certificados son educativos y sirven para validar tu aprendizaje personal. Estamos trabajando en alianzas con instituciones para que los certificados tengan reconocimiento formal.',
  },
  {
    q: '¿Cómo puedo contribuir o proponer un curso?',
    a: 'Puedes contactarnos desde la sección de contacto. Estamos abiertos a colaboraciones con expertos, organizaciones civiles y universidades que quieran publicar contenido en la plataforma.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">
            Preguntas{' '}
            <span className="neon-text-cyan">frecuentes</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-xl border transition-all duration-200',
                open === idx ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
              )}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
              >
                <span className="font-medium text-foreground text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={cn('w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200', open === idx && 'rotate-180 text-primary')}
                />
              </button>
              {open === idx && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
