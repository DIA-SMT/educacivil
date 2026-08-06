import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { FeaturedCourses } from '@/components/home/featured-courses'
import { MethodologySection } from '@/components/home/methodology-section'
import { FaqSection } from '@/components/home/faq-section'
import { CtaSection } from '@/components/home/cta-section'

// La home lista cursos destacados desde Supabase. Sin esto quedaba congelada en
// el build y un curso nuevo no aparecía nunca hasta el próximo deploy. Usamos
// ISR de 5 minutos (la landing es la página más visitada) y además el panel
// admin hace revalidatePath('/') al tocar un curso.
export const revalidate = 300

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <FeaturedCourses />
        <MethodologySection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
