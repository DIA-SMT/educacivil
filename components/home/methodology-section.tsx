import { BookOpen, MapPin, Users, Award, PlayCircle, FileText, CheckCircle2, Bot, Play } from 'lucide-react'

const steps = [
  {
    icon: Play,
    number: '01',
    title: 'Elige tu curso',
    description: 'Explora el catálogo por categoría, nivel o interés. Cada curso tiene una descripción completa y un temario detallado.',
  },
  {
    icon: Play,
    number: '02',
    title: 'Aprende a tu ritmo',
    description: 'Accede a videos, materiales descargables y ejercicios prácticos. Marca tu progreso y continúa desde cualquier dispositivo.',
  },
  {
    icon: Bot,
    number: '03',
    title: 'Uso de Inteligencia Artificial',
    description: 'Cada curso incluye Asistentes ciudadanIA con prompts específicos para aplicar lo aprendido usando herramientas como ChatGPT o Claude.',
  },
  {
    icon: Award,
    number: '04',
    title: 'Obtén tu certificado',
    description: 'Al completar el curso, recibe un certificado digital verificable que puedes compartir en LinkedIn y redes sociales.',
  },
]

export function MethodologySection() {
  return (
    <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Metodología
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance max-w-2xl mx-auto">
            Aprende, practica y{' '}
            <span className="neon-text">certifica</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Un proceso de aprendizaje diseñado para generar cambio real, no solo conocimiento teórico.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center gap-4">
                {/* Number bubble */}
                <div className="relative z-10 w-20 h-20 rounded-2xl glass border border-primary/30 flex flex-col items-center justify-center gap-1">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
