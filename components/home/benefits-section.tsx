import { Shield, Zap, Globe, Award, Users, Brain } from 'lucide-react'

const benefits = [
  {
    icon: Brain,
    title: 'Aprende con IA',
    description: 'Guías prácticas con prompts listos para usar en ChatGPT, Claude y otras herramientas de IA aplicadas a la ciudadanía.',
  },
  {
    icon: Shield,
    title: 'Contenido verificado',
    description: 'Cursos desarrollados con expertos en derecho, ciencias políticas y gobernanza pública de universidades reconocidas.',
  },
  {
    icon: Globe,
    title: 'Impacto real',
    description: 'Herramientas y plantillas prácticas para participar en consultas públicas, solicitar información y organizarse.',
  },
  {
    icon: Zap,
    title: 'Progreso a tu ritmo',
    description: 'Aprende cuando quieras, marca lecciones completadas y retoma exactamente donde lo dejaste.',
  },
  {
    icon: Award,
    title: 'Certificación',
    description: 'Obtén certificados verificables al completar cursos. Próximamente con emisión en blockchain.',
  },
  {
    icon: Users,
    title: 'Comunidad activa',
    description: 'Conecta con otros ciudadanos, comparte experiencias y construye redes de participación ciudadana.',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Por qué elegirnos
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance max-w-2xl mx-auto">
            Formación ciudadana que{' '}
            <span className="neon-text">cambia perspectivas</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty leading-relaxed">
            No es solo teoría. CiviLearn combina conocimiento experto con herramientas prácticas para que actúes, no solo sepas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="glass rounded-xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
