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
        blue: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-white', subtext: 'text-slate-400', icon: 'text-red-500' },
        emerald: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-white', subtext: 'text-slate-400', icon: 'text-red-500' },
        violet: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-white', subtext: 'text-slate-400', icon: 'text-red-500' },
        amber: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-white', subtext: 'text-slate-400', icon: 'text-red-500' },
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Centro de <span className="text-red-600">Comando</span></h1>
                <p className="text-slate-500 text-sm max-w-2xl">
                    Gestión integral de la plataforma educativa Hub IA. Supervisión de cursos, asistentes y métricas de uso ciudadano.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const c = colorMap[stat.color]
                    const Icon = stat.icon
                    const card = (
                        <div className={`p-8 rounded-[2rem] border ${c.border} ${c.bg} h-full group transition-all duration-300 hover:bg-red-600/10 hover:border-red-500/40 hover:-translate-y-1 relative overflow-hidden shadow-2xl shadow-red-950/20`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl -mr-12 -mt-12 group-hover:bg-red-600/10 transition-colors"></div>
                            <div className="flex flex-row items-center justify-between pb-4">
                                <h3 className={`text-xs font-bold uppercase tracking-widest ${c.subtext}`}>{stat.label}</h3>
                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                                    <Icon className={`w-5 h-5 ${c.icon} group-hover:scale-110 transition-transform`} />
                                </div>
                            </div>
                            <div className={`text-3xl font-black ${c.text} tracking-tight`}>{stat.value}</div>
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
