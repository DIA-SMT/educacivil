import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { adminUpdateUserProfile } from '@/app/admin/actions'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export const revalidate = 0

interface Props {
    params: Promise<{ id: string }>
    searchParams: Promise<{ error?: string; saved?: string }>
}

const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos: nombre y apellido deben tener al menos 2 letras, y el DNI entre 7 y 9 dígitos sin puntos.',
    dni_taken: 'Ese DNI ya está registrado en otra cuenta.',
    save_error: 'No pudimos guardar los cambios.',
}

export default async function AdminEditUserPage({ params, searchParams }: Props) {
    const { id } = await params
    const { error, saved } = await searchParams

    const supabase = await createClient()
    const { data: user } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name, dni, profile_locked_at, role')
        .eq('id', id)
        .single()

    if (!user) notFound()

    const updateWithId = adminUpdateUserProfile.bind(null, id)

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar usuario</h1>
                    <p className="text-muted-foreground mt-2 text-sm">{user.email}</p>
                </div>
                <Link
                    href="/admin/users"
                    className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted/40"
                >
                    Volver
                </Link>
            </div>

            {saved && (
                <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                    <div className="text-sm">Datos actualizados.</div>
                </div>
            )}

            {error && errorMessages[error] && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div className="text-sm">{errorMessages[error]}</div>
                </div>
            )}

            <form action={updateWithId} className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
                <div className="space-y-2">
                    <label htmlFor="first_name" className="text-sm font-medium">Nombre/s</label>
                    <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        defaultValue={user.first_name || ''}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/60"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="last_name" className="text-sm font-medium">Apellido/s</label>
                    <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        defaultValue={user.last_name || ''}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/60"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="dni" className="text-sm font-medium">DNI</label>
                    <input
                        id="dni"
                        name="dni"
                        type="text"
                        required
                        inputMode="numeric"
                        pattern="\d{7,9}"
                        defaultValue={user.dni || ''}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/60"
                    />
                </div>

                {user.profile_locked_at && (
                    <label className="flex items-start gap-3 pt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="unlock"
                            className="mt-1 w-4 h-4 rounded border-border bg-muted/50 text-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                            Desbloquear el perfil del usuario después de guardar (le permite volver a editarlo
                            desde su cuenta).
                        </span>
                    </label>
                )}

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
                >
                    Guardar cambios
                </button>
            </form>
        </div>
    )
}
