import Link from 'next/link'
import { LayoutDashboard, BookOpen, Bot, Users, IdCard } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-[#050507] text-slate-200 flex flex-col md:flex-row font-sans">
            {/* Sidebar for Admin */}
            <aside className="w-full md:w-72 md:sticky md:top-0 md:h-screen md:overflow-y-auto border-r border-red-950/30 bg-[#0a0a0c]/80 backdrop-blur-xl p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Hub <span className="text-red-500">Admin</span></h2>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Área Protegida</span>
                    </div>
                </div>

                <div className="px-3 py-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Administrador</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">{profile?.full_name || user.email}</p>
                </div>

                <nav className="flex flex-col gap-1.5 flex-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-sm font-medium transition-all group">
                        <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Dashboard
                    </Link>
                    <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-sm font-medium transition-all group">
                        <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Cursos
                    </Link>
                    <Link href="/admin/guides" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-sm font-medium transition-all group">
                        <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Asistentes
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-sm font-medium transition-all group">
                        <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Usuarios
                    </Link>
                    <Link href="/admin/cidituc-users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/5 text-slate-400 hover:text-red-400 text-sm font-medium transition-all group">
                        <IdCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Usuarios CiDiTuc
                    </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 text-sm font-bold transition-all border border-red-950/30"
                        >
                            Cerrar sesión
                        </button>
                    </form>

                    <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 text-center transition-colors">
                        &larr; Volver al Portal Público
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#050507] via-[#050507] to-[#1a0505]/10">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
            <Toaster richColors position="top-right" />
        </div>
    )
}
