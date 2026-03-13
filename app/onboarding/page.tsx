import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { saveProfile } from '@/app/signin/actions'
import Link from 'next/link'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/signin')

  // If already has name, skip to home
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (profile?.full_name) redirect('/')

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">¡Hola! Completá tu perfil</h1>
          <p className="text-muted-foreground text-sm">
            Solo necesitamos tu nombre para personalizar tu experiencia.
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center mb-4">
              No pudimos guardar tu información. Intentá de nuevo.
            </div>
          )}

          <form action={saveProfile} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                Nombre y apellido
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ej: María González"
                required
                minLength={2}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary"
            >
              Continuar
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            <Link href="/" className="text-primary/70 hover:text-primary transition-colors">
              Omitir por ahora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
