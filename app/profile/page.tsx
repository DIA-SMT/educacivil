import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { saveLegalProfile } from './actions'
import { Navbar } from '@/components/navbar'
import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'

interface Props {
    searchParams: Promise<{ error?: string; saved?: string }>
}

const errorMessages: Record<string, string> = {
    invalid: 'Revisá los datos: nombre y apellido deben tener al menos 2 letras, y el DNI debe tener entre 7 y 9 dígitos sin puntos.',
    not_confirmed: 'Tenés que tildar la casilla de confirmación.',
    locked: 'Tu perfil ya fue guardado y no puede modificarse. Contactá a un administrador si hay un error.',
    dni_taken: 'Ese DNI ya está registrado en otra cuenta.',
    save_error: 'No pudimos guardar los datos. Intentá de nuevo.',
}

export default async function ProfilePage({ searchParams }: Props) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/signin?next=/profile')

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, dni, profile_locked_at, email')
        .eq('id', user.id)
        .single()

    const { error, saved } = await searchParams
    const locked = !!profile?.profile_locked_at

    return (
        <div className="min-h-screen flex flex-col bg-[#020817]">
            <Navbar />
            <main className="flex-1 pt-24 pb-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Mi perfil</h1>
                        <p className="text-muted-foreground text-sm">
                            Estos datos se usan para emitir tus certificados de cursos.
                        </p>
                    </div>

                    {saved && (
                        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 mb-6">
                            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">Tus datos fueron guardados correctamente.</div>
                        </div>
                    )}

                    {error && errorMessages[error] && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6">
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">{errorMessages[error]}</div>
                        </div>
                    )}

                    {!locked && (
                        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 mb-6">
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-semibold mb-1">Importante: estos datos se podrán guardar una sola vez.</p>
                                <p>
                                    Verificá que tu nombre/s, apellido/s y DNI estén escritos exactamente como
                                    querés que aparezcan en tus certificados. Una vez guardados no vas a poder
                                    modificarlos. Si necesitás corregir algo después, vas a tener que
                                    contactar a un administrador.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
                        <form action={saveLegalProfile} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="first_name">
                                    Nombre/s
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    defaultValue={profile?.first_name || ''}
                                    disabled={locked}
                                    placeholder="Ej: María Soledad"
                                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="last_name">
                                    Apellido/s
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    defaultValue={profile?.last_name || ''}
                                    disabled={locked}
                                    placeholder="Ej: González Pérez"
                                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="dni">
                                    DNI <span className="text-muted-foreground font-normal">(sin puntos)</span>
                                </label>
                                <input
                                    id="dni"
                                    name="dni"
                                    type="text"
                                    required
                                    inputMode="numeric"
                                    pattern="\d{7,9}"
                                    defaultValue={profile?.dni || ''}
                                    disabled={locked}
                                    placeholder="Ej: 35123456"
                                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={profile?.email || user.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground cursor-not-allowed"
                                />
                            </div>

                            {!locked && (
                                <>
                                    <label className="flex items-start gap-3 pt-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="confirmed"
                                            required
                                            className="mt-1 w-4 h-4 rounded border-border bg-muted/50 text-primary focus:ring-primary/40"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            Confirmo que los datos ingresados son correctos y entiendo que no
                                            podré modificarlos después de guardar.
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary"
                                    >
                                        Guardar definitivamente
                                    </button>
                                </>
                            )}

                            {locked && (
                                <div className="flex items-start gap-3 bg-muted/40 border border-border rounded-xl p-4">
                                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                    <div className="text-sm text-muted-foreground">
                                        Tu perfil está bloqueado. Si necesitás corregir alguno de estos datos,
                                        escribinos para que un administrador lo modifique.
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/" className="text-sm text-primary/70 hover:text-primary transition-colors">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
