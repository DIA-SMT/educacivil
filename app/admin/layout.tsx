import Link from 'next/link'
import { LayoutDashboard, BookOpen, Bot } from 'lucide-react'
import { logout } from '@/app/login/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar for Admin */}
            <aside className="w-full md:w-64 border-r border-border/50 bg-card p-6 flex flex-col gap-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground">Área Oculta</p>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <Link href="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
                        <BookOpen className="w-4 h-4" />
                        Cursos
                    </Link>
                    <Link href="/admin/guides" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
                        <Bot className="w-4 h-4" />
                        Guías / Agentes IA
                    </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full text-left text-sm font-medium text-destructive hover:underline"
                        >
                            Cerrar sesión
                        </button>
                    </form>

                    <Link href="/" className="text-sm font-medium text-primary hover:underline">
                        &larr; Volver al sitio
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
