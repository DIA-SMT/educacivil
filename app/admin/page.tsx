import { createClient } from '@/utils/supabase/server'
import { supabase } from '@/lib/supabase'
import { BookOpen, Bot, Users, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboardPage() {
    const serverSupabase = await createClient()

    const [
        { count: coursesCount },
        { count: guidesCount },
        { count: usersCount },
        { count: activeUsersCount },
        { data: topAssistants },
    ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('ai_guides').select('*', { count: 'exact', head: true }),
        serverSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serverSupabase
            .from('assistant_usage')
            .select('user_id', { count: 'exact', head: false })
            .then(async ({ data }) => {
                const uniqueUsers = new Set(data?.map((r: any) => r.user_id)).size
                return { count: uniqueUsers }
            }),
        serverSupabase
            .from('assistant_usage')
            .select('assistant_slug, assistant_title')
            .then(({ data }) => {
                if (!data) return { data: [] }
                const counts: Record<string, { title: string; count: number }> = {}
                data.forEach((row: any) => {
                    if (!counts[row.assistant_slug]) {
                        counts[row.assistant_slug] = { title: row.assistant_title ?? row.assistant_slug, count: 0 }
                    }
                    counts[row.assistant_slug].count++
                })
                const sorted = Object.entries(counts)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([slug, v]) => ({ slug, ...v }))
                return { data: sorted }
            }),
    ])

    const stats = [
        {
            label: 'Cursos Activos',
            value: coursesCount ?? 0,
            icon: BookOpen,
            href: '/admin/courses',
            color: 'blue',
        },
        {
            label: 'Asistentes ciudadanIA',
            value: guidesCount ?? 0,
            icon: Bot,
            href: '/admin/guides',
            color: 'emerald',
        },
        {
            label: 'Usuarios Registrados',
            value: usersCount ?? 0,
            icon: Users,
            href: null,
            color: 'violet',
        },
        {
            label: 'Usuarios que usaron Asistentes',
            value: activeUsersCount ?? 0,
            icon: Zap,
            href: null,
            color: 'amber',
        },
    ]

    const colorMap: Record<string, { border: string; bg: string; text: string; subtext: string; icon: string }> = {
        blue: { border: 'border-blue-200 dark:border-blue-900/50', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-950 dark:text-blue-50', subtext: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
        emerald: { border: 'border-emerald-200 dark:border-emerald-900/50', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-950 dark:text-emerald-50', subtext: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
        violet: { border: 'border-violet-200 dark:border-violet-900/50', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-950 dark:text-violet-50', subtext: 'text-violet-700 dark:text-violet-400', icon: 'text-violet-600 dark:text-violet-400' },
        amber: { border: 'border-amber-200 dark:border-amber-900/50', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-950 dark:text-amber-50', subtext: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
                <p className="text-muted-foreground mt-2">Visión general de la plataforma Hub IA.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const c = colorMap[stat.color]
                    const Icon = stat.icon
                    const card = (
                        <div className={`p-6 rounded-xl border ${c.border} ${c.bg} h-full group transition-colors`}>
                            <div className="flex flex-row items-center justify-between pb-2">
                                <h3 className={`text-sm font-medium ${c.subtext}`}>{stat.label}</h3>
                                <Icon className={`w-4 h-4 ${c.icon} group-hover:scale-110 transition-transform`} />
                            </div>
                            <div className={`text-2xl font-bold ${c.text}`}>{stat.value}</div>
                        </div>
                    )
                    return stat.href ? (
                        <Link key={stat.label} href={stat.href} className="block cursor-pointer">
                            {card}
                        </Link>
                    ) : (
                        <div key={stat.label}>{card}</div>
                    )
                })}
            </div>

            {/* Top Assistants */}
            {topAssistants && topAssistants.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-foreground">Asistentes ciudadanIA más usados</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        {topAssistants.map((a: any, i: number) => (
                            <div key={a.slug} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                    <Link href={`/ai-guides/${a.slug}`} className="text-sm text-foreground hover:text-primary transition-colors">
                                        {a.title}
                                    </Link>
                                </div>
                                <span className="text-sm font-semibold text-primary">{a.count} {a.count === 1 ? 'uso' : 'usos'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {topAssistants && topAssistants.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
                    Todavía no hay registros de uso de Asistentes ciudadanIA.
                </div>
            )}
        </div>
    )
}
