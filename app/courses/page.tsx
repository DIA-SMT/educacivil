import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CourseCatalog } from '@/components/courses/course-catalog'

export const metadata = {
  title: 'Catálogo de Cursos — CiviLearn',
  description: 'Explora todos los cursos de formación ciudadana. Democracia, derechos humanos, transparencia y gobernanza digital.',
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <CourseCatalog />
      </main>
      <Footer />
    </div>
  )
}
