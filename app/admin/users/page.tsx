import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Lock, Unlock } from 'lucide-react'

export const revalidate = 0

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const supabase = await createClient()

    let query = supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name, dni, profile_locked_at, role')
        .order('updated_at', { ascending: false })
        .limit(100)

    if (q && q.trim()) {
        const term = `%${q.trim()}%`
        query = query.or(
            `email.ilike.${term},full_name.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},dni.ilike.${term}`
        )
    }

    const { data: users } = await query

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuarios</h1>
                    <p className="text-muted-foreground mt-2">
                        Editá nombre/s, apellido/s o DNI de cualquier usuario, incluso si su perfil
                        ya está bloqueado.
                    </p>
                </div>
            </div>

            <form className="flex gap-2" action="/admin/users">
                <input
                    name="q"
                    defaultValue={q || ''}
                    placeholder="Buscar por email, nombre, apellido o DNI"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/60"
                />
                <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                    Buscar
                </button>
            </form>

            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                            <th className="text-left px-4 py-3 font-semibold">Email</th>
                            <th className="text-left px-4 py-3 font-semibold">DNI</th>
                            <th className="text-left px-4 py-3 font-semibold">Estado</th>
                            <th className="text-right px-4 py-3 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(users || []).map((u: any) => (
                            <tr key={u.id} className="border-t border-border/50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">
                                        {u.full_name || '(sin nombre)'}
                                    </div>
                                    {u.role === 'admin' && (
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                            admin
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.dni || '—'}</td>
                                <td className="px-4 py-3">
                                    {u.profile_locked_at ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                            <Unlock className="w-3 h-3" /> Editable
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/admin/users/${u.id}`}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!users || users.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                    Sin resultados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
