import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signInWithGoogle } from './actions'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Hub IA',
  description: 'Accede a tu cuenta para guardar tu progreso y acceder a los Asistentes ciudadanIA.',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

  const { error, next } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="font-bold text-2xl tracking-tight">
              Hub <span className="text-primary neon-text-cyan">IA</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Bienvenido/a</h1>
          <p className="text-muted-foreground text-sm">
            Iniciá sesión para guardar tu progreso y usar los Asistentes ciudadanIA
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 flex flex-col gap-6">

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              Ocurrió un error al iniciar sesión. Intentá de nuevo.
            </div>
          )}

          {/* Google OAuth */}
          <form action={signInWithGoogle}>
            {next && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">o</span>
            </div>
          </div>

          {/* Browsing without account */}
          <p className="text-center text-xs text-muted-foreground">
            También podés explorar la plataforma sin cuenta.{' '}
            <Link href="/" className="text-primary hover:opacity-80 font-medium">
              Ir al inicio
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al iniciar sesión, aceptás nuestros términos de uso y política de privacidad.
        </p>
      </div>
    </div>
  )
}
