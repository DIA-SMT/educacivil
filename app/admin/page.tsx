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
                <Link href="/admin/courses" className="block p-6 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800 transition-colors cursor-pointer h-full group">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">Cursos Activos</h3>
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-950 dark:text-blue-50">{coursesCount || 0}</div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Gestionar catálogo de cursos</p>
                    </div>
                </Link>

                <Link href="/admin/guides" className="block p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer h-full group">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Agentes de IA</h3>
                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">{guidesCount || 0}</div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Gestionar personalidades y prompts</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
