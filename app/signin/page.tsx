'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './actions'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react'

function SignInForm() {
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const next = searchParams.get('next')
  const initialEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(initialEmail)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    // The form action will handle the actual server submission
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="font-bold text-2xl tracking-tight">
              Hub <span className="text-primary neon-text-cyan">IA</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2 transition-all duration-300">
            {isSignUp ? 'Crear cuenta' : 'Bienvenido/a'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp 
              ? 'Unite a la plataforma de aprendizaje ciudadanIA' 
              : 'Iniciá sesión para guardar tu progreso'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 flex flex-col gap-6 shadow-xl border-border/50">
          
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center animate-in fade-in slide-in-from-top-1">
              {error === 'google_error' && 'Error al conectar con Google.'}
              {error === 'auth_error' && 'Email o contraseña incorrectos.'}
              {error === 'signup_error' && 'No pudimos crear la cuenta. ¿Ya existe?'}
              {error !== 'google_error' && error !== 'auth_error' && error !== 'signup_error' && 'Ocurrió un error. Intentá de nuevo.'}
            </div>
          )}

          {message === 'confirm_email' && (
            <div className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center animate-in fade-in slide-in-from-top-1">
              ¡Cuenta creada! Revisá tu email para confirmar el registro.
            </div>
          )}

          {/* Google OAuth - Primordial */}
          <form action={signInWithGoogle}>
            {next && <input type="hidden" name="next" value={next} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-background px-3 text-muted-foreground/60">o con email</span>
            </div>
          </div>

          {/* Email / Password Flow */}
          <form 
            action={isSignUp ? signUpWithEmail : signInWithEmail} 
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Contraseña"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 mt-2 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <>Crear cuenta <UserPlus className="w-4 h-4" /></>
              ) : (
                <>Ingresar <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Toggle Login/SignUp */}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center font-medium py-1"
          >
            {isSignUp 
              ? '¿Ya tenés cuenta? Iniciá sesión' 
              : '¿No tenés cuenta? Registrate gratis'}
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8 leading-relaxed">
          Al continuar, aceptás nuestros <Link href="#" className="underline">términos de uso</Link> y <Link href="#" className="underline">política de privacidad</Link>.
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
