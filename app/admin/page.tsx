import { createClient } from '@/utils/supabase/server'
import { supabase } from '@/lib/supabase'
import { BookOpen, Bot, Users, Zap, TrendingUp, History, BarChart3, Award } from 'lucide-react'
import { createServiceClient } from '@/utils/supabase/service'
import Link from 'next/link'
import { UsageChart } from '@/components/admin/usage-chart'
import { RecentUsageTable } from '@/components/admin/usage-table'
import { ActiveUsersList } from '@/components/admin/active-users-list'
import { subDays, format, startOfDay } from 'date-fns'

export const revalidate = 0

export default async function AdminDashboardPage() {
    const serverSupabase = await createClient()

    // Fetch stats and chart data
    // Fetch all stats using server client for consistency and RLS
    const [
        { count: coursesCount },
        { count: guidesCount },
        { count: usersCount },
        { data: usageData },
        { data: recentLogs },
    ] = await Promise.all([
        serverSupabase.from('courses').select('*', { count: 'exact', head: true }),
        serverSupabase.from('ai_guides').select('*', { count: 'exact', head: true }),
        serverSupabase.from('profiles').select('*', { count: 'exact', head: true }),
        serverSupabase.from('assistant_usage').select('assistant_slug, assistant_title, user_id'),
        serverSupabase
            .from('assistant_usage')
            .select(`
                id, assistant_slug, assistant_title, used_at, user_id,
                profiles (full_name, email)
            `)
            .order('used_at', { ascending: false })
            .limit(10),
    ])

    // Los certificados tienen RLS "cada uno ve lo suyo", así que el conteo va
    // por service-role. El layout de /admin ya validó que sea admin.
    const { count: diplomasCount } = await createServiceClient()
        .from('certificates')
        .select('*', { count: 'exact', head: true })

    // Calculate Active Users Count
    const activeUsersCount = new Set(usageData?.map(r => r.user_id)).size

    // Calculate Top Assistants
    const assistantCounts: Record<string, { title: string; count: number }> = {}
    usageData?.forEach((row: any) => {
        if (!assistantCounts[row.assistant_slug]) {
            assistantCounts[row.assistant_slug] = { title: row.assistant_title ?? row.assistant_slug, count: 0 }
        }
        assistantCounts[row.assistant_slug].count++
    })
    const topAssistants = Object.entries(assistantCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([slug, v]) => ({ slug, ...v }))

    // Calculate User Activity (for new component)
    const userActivity: Record<string, { name: string; email: string; count: number }> = {}
    recentLogs?.forEach((log: any) => {
        if (log.profiles && !userActivity[log.user_id]) {
            userActivity[log.user_id] = { 
                name: log.profiles.full_name, 
                email: log.profiles.email, 
                count: usageData?.filter(u => u.user_id === log.user_id).length || 0
            }
        }
    })
    const activeUsersList = Object.values(userActivity).sort((a, b) => b.count - a.count)

    // Fetch chart data (last 14 days)
    const { data: rawChartData } = await serverSupabase
        .from('assistant_usage')
        .select('used_at')
        .gte('used_at', subDays(new Date(), 14).toISOString())

    const chartData = Array.from({ length: 14 }).map((_, i) => {
        const date = subDays(new Date(), 13 - i)
        const dateStr = format(date, 'MMM dd')
        const count = rawChartData?.filter(row => 
            format(new Date(row.used_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length || 0
        return { date: dateStr, count }
    })

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
        {
            label: 'Diplomas Emitidos',
            value: diplomasCount ?? 0,
            icon: Award,
            href: '/admin/diplomas',
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

            {/* Analytics Section */}
            <div className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                            <BarChart3 className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Análisis de <span className="text-red-500">Actividad</span></h2>
                    </div>
                    
                    <UsageChart data={chartData} />
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                            <Users className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Ciudadanos <span className="text-red-500">Activos</span></h2>
                    </div>

                    <ActiveUsersList users={activeUsersList} />

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                            <History className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Historial de <span className="text-red-500">Uso</span></h2>
                    </div>
                    
                    <RecentUsageTable logs={recentLogs as any || []} />
                </div>

                <div className="space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                            <TrendingUp className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Más <span className="text-red-500">Usados</span></h2>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex flex-col gap-4">
                            {topAssistants && topAssistants.map((a: any, i: number) => (
                                <div key={a.slug} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 text-xs font-bold text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                            {i + 1}
                                        </div>
                                        <Link href={`/ai-guides/${a.slug}`} className="text-sm font-bold text-slate-300 hover:text-red-500 transition-colors">
                                            {a.title}
                                        </Link>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-white">{a.count}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Usos</span>
                                    </div>
                                </div>
                            ))}
                            {(!topAssistants || topAssistants.length === 0) && (
                                <div className="py-10 text-center text-slate-500 text-sm italic">
                                    Sin registros aún.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick CTA */}
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-red-600 to-red-900 shadow-2xl shadow-red-600/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-black text-white leading-tight mb-2">¿Necesitas nuevos asistentes?</h3>
                        <p className="text-red-100/70 text-xs mb-6">Continúa expandiendo las capacidades de IA para los ciudadanos.</p>
                        <Link href="/admin/guides" className="inline-flex items-center justify-center w-full py-3 bg-white text-red-700 rounded-xl text-sm font-black hover:bg-red-50 transition-colors shadow-lg">
                            Gestionar Asistentes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
