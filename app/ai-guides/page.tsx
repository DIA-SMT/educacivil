import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AiGuidesGrid } from '@/components/ai-guides/ai-guides-grid'

export const metadata = {
  title: 'Guías de IA — CiviLearn',
  description: 'Guías prácticas para usar inteligencia artificial en participación ciudadana: verificar información, solicitar datos públicos, analizar leyes y más.',
}

export default function AiGuidesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <AiGuidesGrid />
      </main>
      <Footer />
    </div>
  )
}
