import { createClient } from '@/utils/supabase/server'

const CERTIFICATE_SELECT = `
  id,
  course_slug,
  certificate_code,
  issued_at,
  student_name_snapshot,
  course_title_snapshot
`

export interface CertificateRecord {
  id: string
  course_slug: string
  certificate_code: string
  issued_at: string
  student_name_snapshot: string
  course_title_snapshot: string
}

function generateCertificateCode() {
  return `CIVI-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`
}

async function findCertificateForUser(userId: string, courseSlug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select(CERTIFICATE_SELECT)
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo recuperar el certificado: ${error.message}`)
  }

  return data as CertificateRecord | null
}

export async function getOrCreateCertificate(params: {
  userId: string
  courseSlug: string
  studentName: string
  courseTitle: string
}) {
  const existing = await findCertificateForUser(params.userId, params.courseSlug)
  if (existing) return existing

  const supabase = await createClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: params.userId,
        course_slug: params.courseSlug,
        certificate_code: generateCertificateCode(),
        student_name_snapshot: params.studentName,
        course_title_snapshot: params.courseTitle,
      })
      .select(CERTIFICATE_SELECT)
      .single()

    if (!error) {
      return data as CertificateRecord
    }

    const racedCertificate = await findCertificateForUser(params.userId, params.courseSlug)
    if (racedCertificate) return racedCertificate

    if (error.code !== '23505') {
      throw new Error(`No se pudo emitir el certificado: ${error.message}`)
    }
  }

  throw new Error('No se pudo emitir el certificado luego de varios intentos')
}
