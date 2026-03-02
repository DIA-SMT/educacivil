import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { FeaturedCourses } from '@/components/home/featured-courses'
import { MethodologySection } from '@/components/home/methodology-section'
import { FaqSection } from '@/components/home/faq-section'
import { CtaSection } from '@/components/home/cta-section'

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
