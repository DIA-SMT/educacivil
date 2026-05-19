import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

interface Props {
  params: Promise<{ code: string }>
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params

  const { data, error } = await supabase
    .rpc('verify_certificate', { p_code: code })
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo validar el certificado: ${error.message}`)
  }

  const certificate = data as
    | {
        certificate_code: string
        issued_at: string
        student_name_snapshot: string
        course_title_snapshot: string
      }
    | null

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {certificate ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
                    Certificado válido
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight">Verificación exitosa</h1>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Alumno</p>
                  <p className="mt-2 text-lg font-semibold text-white">{certificate.student_name_snapshot}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Curso</p>
                  <p className="mt-2 text-lg font-semibold text-white">{certificate.course_title_snapshot}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Fecha de emisión</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {format(new Date(certificate.issued_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Código</p>
                  <p className="mt-2 text-lg font-semibold text-white">{certificate.certificate_code}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-400">
                    Certificado no encontrado
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight">No pudimos validar este certificado</h1>
                </div>
              </div>

              <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                El código escaneado no coincide con un certificado emitido por la plataforma. Revisá el QR o pedí una nueva copia del certificado original.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
