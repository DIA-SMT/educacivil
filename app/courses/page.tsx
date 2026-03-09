import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CourseCatalog } from '@/components/courses/course-catalog'

export const revalidate = 0

export const metadata = {
  title: 'Catálogo de Cursos — CiviLearn',
  description: 'Explora todos los cursos de formación ciudadana. Democracia, derechos humanos, transparencia y gobernanza digital.',
}

export default async function CoursesPage() {
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, subtitle, category, level, duration, badge, thumbnail, description, instructor, rating, students, ai_guide_slug')
    .order('students', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <CourseCatalog courses={courses || []} />
      </main>
      <Footer />
    </div>
  )
}
