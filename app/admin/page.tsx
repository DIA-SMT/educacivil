import { supabase } from '@/lib/supabase'
import { BookOpen, Bot, Users } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboardPage() {
    const [{ count: coursesCount }, { count: guidesCount }] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('ai_guides').select('*', { count: 'exact', head: true })
    ])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
                <p className="text-muted-foreground mt-2">Visión general de la plataforma EducaCivil.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/courses" className="block p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium">Cursos Activos</h3>
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{coursesCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Gestionar catálogo de cursos</p>
                    </div>
                </Link>

                <Link href="/admin/guides" className="block p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium">Agentes de IA</h3>
                        <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{guidesCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Gestionar personalidades y prompts</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
