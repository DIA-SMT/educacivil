import { createServiceClient } from '@/utils/supabase/service'

export const revalidate = 0

function formatFecha(value: string | null): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default async function AdminCiditucUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  let users: any[] | null = null
  let error: string | null = null

  try {
    const supabase = createServiceClient()
    let query = supabase
      .from('cidituc_users')
      .select('id_persona, dni, nombre, apellido, email, primer_ingreso, ultimo_ingreso, ingresos')
      .order('ultimo_ingreso', { ascending: false })
      .limit(200)

    if (q && q.trim()) {
      const term = `%${q.trim()}%`
      query = query.or(
        `nombre.ilike.${term},apellido.ilike.${term},dni.ilike.${term},email.ilike.${term}`
      )
    }

    const { data, error: qError } = await query
    if (qError) throw qError
    users = data
  } catch (e) {
    error = e instanceof Error ? e.message : 'No se pudo cargar la tabla.'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuarios CiDiTuc</h1>
          <p className="text-muted-foreground mt-2">
            Personas que ingresaron con CiDiTuc, con su último ingreso y cantidad de veces.
          </p>
        </div>
      </div>

      <form className="flex gap-2" action="/admin/cidituc-users">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar por nombre, apellido, DNI o email"
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/60"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          No se pudo cargar la trazabilidad: {error}. Verificá que exista la tabla
          <code className="mx-1">cidituc_users</code> y la variable
          <code className="mx-1">SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      )}

      {!error && (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Persona</th>
                <th className="text-left px-4 py-3 font-semibold">DNI</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Último ingreso</th>
                <th className="text-right px-4 py-3 font-semibold">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u: any) => (
                <tr key={u.id_persona} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {[u.nombre, u.apellido].filter(Boolean).join(' ') || '(sin nombre)'}
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">id {u.id_persona}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.dni || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatFecha(u.ultimo_ingreso)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{u.ingresos}</td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Sin ingresos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
