import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'
import { supabase as publicSupabase } from '@/lib/supabase'
import { getOrCreateCertificate, findCertificateForUser } from '@/lib/certificates'
import { Certificate } from '@/components/learn/certificate'
import { PrintButton } from '@/components/learn/print-button'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CertificatePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const baseUrl = await getBaseUrl()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, dni, full_name, profile_locked_at')
    .eq('id', user.id)
    .single()

  if (!profile?.first_name || !profile?.last_name || !profile?.dni) {
    redirect(`/profile?next=/courses/${slug}/certificate`)
  }

  const studentDni = profile.dni

  // Un diploma ya emitido se muestra SIEMPRE, y se busca antes que el curso.
  // Por eso guardamos los snapshots: si el curso se edita o se da de baja, el
  // certificado que el vecino ya tiene (y cuyo código sigue verificándose en
  // público) tiene que seguir siendo accesible.
  let certificate = await findCertificateForUser(user.id, slug)

  if (!certificate) {
    const { data: course } = await publicSupabase
      .from('courses')
      .select(`
        title,
        modules (
          lessons (
            id
          )
        )
      `)
      .eq('slug', slug)
      .single()

    if (!course) {
      notFound()
    }

    const lessonIds: string[] = (course.modules ?? []).flatMap((module: { lessons?: Array<{ id: string }> | null }) =>
      (module.lessons ?? []).map((lesson) => lesson.id)
    )

    if (lessonIds.length === 0) {
      redirect(`/courses/${slug}`)
    }

    const { data: progressRows, error: progressError } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_slug', slug)
      .eq('completed', true)
      .in('lesson_id', lessonIds)

    if (progressError) {
      throw new Error(`No se pudo validar el progreso del curso: ${progressError.message}`)
    }

    const completedLessonIds = new Set((progressRows ?? []).map((row: { lesson_id: string }) => row.lesson_id))
    const isCourseCompleted = lessonIds.every((lessonId) => completedLessonIds.has(lessonId))

    if (!isCourseCompleted) {
      redirect(`/courses/${slug}`)
    }

    certificate = await getOrCreateCertificate({
      userId: user.id,
      courseSlug: slug,
      studentName: `${profile.first_name} ${profile.last_name}`,
      courseTitle: course.title,
    })
  }

  // Se imprimen los snapshots guardados al emitirlo, no los datos vivos: es lo
  // que valida la página pública /certificates/[code], y tienen que coincidir.
  const studentName = certificate.student_name_snapshot
  const courseTitle = certificate.course_title_snapshot

  const verificationUrl = `${baseUrl}/certificates/${certificate.certificate_code}`

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 print:flex print:h-screen print:min-h-0 print:items-center print:justify-center print:overflow-hidden print:bg-white print:p-0">
      <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between print:hidden">
        {/* "Mis certificados" siempre funciona; el link al curso puede quedar
            muerto si el curso se dio de baja después de emitir el diploma. */}
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Mis certificados
        </Link>

        <PrintButton />
      </div>

      <div className="mx-auto w-full max-w-4xl print:w-[100vw] print:max-w-none">
        <div className="print:scale-100">
          <Certificate
            studentName={studentName}
            studentDni={studentDni}
            courseName={courseTitle}
            date={new Date(certificate.issued_at)}
            verificationUrl={verificationUrl}
            certificateCode={certificate.certificate_code}
          />
        </div>
      </div>
    </div>
  )
}
