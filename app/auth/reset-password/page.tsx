'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryError = searchParams.get('error')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(queryError)
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        async function initializeRecoverySession() {
            const { data, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                setError('No pudimos validar el enlace de recuperación. Pedí uno nuevo.')
                return
            }

            if (!data.session) {
                setError('El enlace de recuperación no es válido o ya expiró. Pedí uno nuevo.')
                return
            }

            setSessionReady(true)
        }

        initializeRecoverySession()
    }, [])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const password = String(formData.get('password') ?? '')
        const confirmPassword = String(formData.get('confirmPassword') ?? '')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            setLoading(false)
            return
        }

        const supabase = createClient()
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
            setError('La sesión de recuperación no está disponible. Pedí un enlace nuevo.')
            setLoading(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        })

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        router.replace('/signin?message=password_updated')
        router.refresh()
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-foreground mb-2 text-balance leading-tight">Nueva contraseña</h1>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                    Establecé tu nueva clave de acceso para recuperar tu cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Nueva contraseña"
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Confirmar contraseña"
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center animate-shake">
                        <p className="text-xs font-bold text-red-500">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !sessionReady}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>Actualizar contraseña <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

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
                        <ResetPasswordForm />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
