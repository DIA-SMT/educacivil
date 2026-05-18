import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { supabase as publicSupabase } from '@/lib/supabase'
import { Certificate } from '@/components/learn/certificate'
import { PrintButton } from '@/components/learn/print-button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CertificatePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch user profile for full name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch course details
  const { data: course } = await publicSupabase
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single()

  if (!course) {
    notFound()
  }

  const studentName = profile?.full_name || user.email?.split('@')[0] || 'Estudiante'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 print:p-0 print:bg-white">
      {/* Action Bar - Hidden when printing */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <Link 
          href={`/courses/${slug}`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Curso
        </Link>
        
        <PrintButton />
      </div>

      {/* The Certificate */}
      <Certificate studentName={studentName} courseName={course.title} />

    </div>
  )
}
