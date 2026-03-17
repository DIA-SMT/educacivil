import { login, signup } from './actions'
import { Lock, Mail, ShieldAlert, Cpu, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507] p-6 relative overflow-hidden font-sans">
            {/* Background elements for atmosphere */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/5 blur-[120px] rounded-full"></div>
            
            <div className="w-full max-w-[400px] z-10 space-y-10 animate-in fade-in zoom-in duration-500">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Terminal de Acceso Seguro</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        Hub <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Admin</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Control Centralizado de la Plataforma EducaCivil</p>
                </div>

                {/* Login Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-red-600/30 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    
                    <div className="relative bg-[#0a0a0c]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-10 shadow-3xl">
                        <form className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="email">Identificador de Usuario</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-red-500 transition-colors" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="admin@educacivil.com"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="password">Palabra Clave</label>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-red-500 transition-colors" />
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 pt-4">
                                <button
                                    formAction={login}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all shadow-xl shadow-red-900/30 active:scale-[0.98] group/btn"
                                >
                                    AUTORIZAR INGRESO
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                
                                <button
                                    formAction={signup}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[11px] uppercase tracking-widest transition-all border border-white/5"
                                >
                                    <Cpu className="w-3.5 h-3.5" />
                                    Generar Acceso Demo
                                </button>
                                
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-[10px] text-center font-bold text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest pt-2"
                                >
                                    Recuperar palabra clave
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer system info */}
                <div className="flex flex-col items-center gap-4">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
                    <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Sistema de Gestión Educativa</p>
                        <p className="text-[11px] text-slate-400 font-medium">HUB IA &copy; 2026 — Núcleo de Administración</p>
                    </div>
                </div>
            </div>

            {/* Subtle aesthetic lines */}
            <div className="absolute top-20 left-0 w-32 h-px bg-gradient-to-r from-red-600/20 to-transparent"></div>
            <div className="absolute bottom-20 right-0 w-32 h-px bg-gradient-to-l from-red-600/20 to-transparent"></div>
        </div>
    )
}
