'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

function SignInForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const error = searchParams.get('error')

  const handleCiditucLogin = () => {
    // CiDiTuc usa HashRouter y dispara el redirect leyendo ?next=hub-ia desde el
    // hash. Por eso se concatena como string (no con URL.searchParams, que lo
    // pondría en el query real, fuera del hash). El destino propio de hub-ia no
    // hace falta reenviarlo: el callback aterriza en "/" por defecto.
    const loginUrl = process.env.NEXT_PUBLIC_CIDITUC_LOGIN_URL
    if (!loginUrl) return
    setLoading(true)
    const sep = loginUrl.includes('?') ? '&' : '?'
    window.location.href = `${loginUrl}${sep}next=hub-ia`
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Bienvenido/a</h1>
          <p className="text-muted-foreground text-sm">
            Ingresá con Ciudadano Digital para guardar tu progreso
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 flex flex-col gap-6 shadow-xl border-border/50">
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center animate-in fade-in slide-in-from-top-1">
              {error === 'cidituc_missing_token' && 'No recibimos el token de CiDiTuc. Intentá de nuevo.'}
              {error === 'cidituc_invalid_token' && 'Tu sesión de CiDiTuc no es válida o expiró.'}
              {error === 'cidituc_session_failed' && 'No pudimos iniciar tu sesión. Intentá de nuevo.'}
              {error !== 'cidituc_missing_token' &&
                error !== 'cidituc_invalid_token' &&
                error !== 'cidituc_session_failed' &&
                'Ocurrió un error. Intentá de nuevo.'}
            </div>
          )}

          {/* CiDiTuc (Ciudadano Digital) — único método de ingreso para vecinos */}
          <button
            type="button"
            onClick={handleCiditucLogin}
            disabled={loading}
            style={{ backgroundColor: '#1b86e3' }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#1b86e3]/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shrink-0">
                  <img src="/logoMuni-sm.png" alt="" className="w-4 h-4 object-contain" />
                </span>
                Ingresar con CiDiTuc
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Usá tu cuenta de Ciudadano Digital (CiDiTuc) del municipio para ingresar. Es gratis y
            con los mismos datos con los que hacés trámites.
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8 leading-relaxed">
          Al continuar, aceptás nuestros <Link href="#" className="underline">términos de uso</Link> y{' '}
          <Link href="#" className="underline">política de privacidad</Link>.
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
