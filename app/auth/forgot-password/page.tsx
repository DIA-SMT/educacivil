'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'

import { forgotPassword } from './actions'

function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const success = searchParams.get('success')
    const [loading, setLoading] = useState(false)

    if (success) {
        return (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">¡Email enviado!</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[320px] mx-auto">
                        Revisá tu bandeja de entrada para continuar con el proceso de recuperación. El mensaje llegará desde un correo institucional.
                    </p>
                </div>
                <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h1 className="text-2xl font-black tracking-tight text-foreground mb-3 text-balance">¿Olvidaste tu contraseña?</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Ingresá tu email y te enviaremos un link desde un correo institucional para restablecerla.
                </p>
            </div>

            <form
                action={forgotPassword}
                onSubmit={() => setLoading(true)}
                className="space-y-5"
            >
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                </div>

                {error && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center animate-shake">
                        <p className="text-xs font-bold text-red-500">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar link de recuperación'}
                </button>

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    Si no lo encontrás en unos minutos, revisá spam o promociones.
                </p>
            </form>

            <div className="text-center pt-2">
                <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3" /> Volver al inicio
                </Link>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-sm z-10 flex flex-col gap-8 animate-in fade-in zoom-in duration-700">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-2">
                        <span className="font-black text-3xl tracking-tighter">
                            Hub <span className="text-primary neon-text-cyan">IA</span>
                        </span>
                    </Link>
                </div>

                <main className="glass shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10 border border-white/5 backdrop-blur-3xl">
                    <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />}>
                        <ForgotPasswordForm />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
