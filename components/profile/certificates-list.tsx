import Link from 'next/link'
import { Award, Download, ExternalLink } from 'lucide-react'
import type { CertificateRecord } from '@/lib/certificates'

/**
 * Los certificados que ya obtuvo el vecino, para tenerlos a mano: ver/imprimir
 * el diploma y copiar el link público de verificación.
 */
export function CertificatesList({ certificates }: { certificates: CertificateRecord[] }) {
    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Mis certificados</h2>
                {certificates.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {certificates.length}
                    </span>
                )}
            </div>

            {certificates.length === 0 ? (
                <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Todavía no tenés certificados. Completá todas las lecciones de un curso
                        y el diploma se emite solo.
                    </p>
                    <Link
                        href="/courses"
                        className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        Ver cursos disponibles
                    </Link>
                </div>
            ) : (
                <ul className="space-y-3">
                    {certificates.map((cert) => (
                        <li
                            key={cert.id}
                            className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{cert.course_title_snapshot}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Emitido el{' '}
                                    {new Date(cert.issued_at).toLocaleDateString('es-AR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground/70 mt-1 break-all">
                                    {cert.certificate_code}
                                </p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <Link
                                    href={`/courses/${cert.course_slug}/certificate`}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <Download className="w-4 h-4" />
                                    Ver / Descargar
                                </Link>
                                <Link
                                    href={`/certificates/${cert.certificate_code}`}
                                    target="_blank"
                                    title="Página pública de verificación"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted/50 border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Verificar
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {certificates.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                    Desde <strong>Ver / Descargar</strong> podés imprimirlo o guardarlo como PDF.
                    El link de <strong>Verificar</strong> es público: sirve para que un tercero
                    confirme que el certificado es auténtico.
                </p>
            )}
        </div>
    )
}
