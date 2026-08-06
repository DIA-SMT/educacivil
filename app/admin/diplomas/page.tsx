import { Award, GraduationCap, Users, BookOpenCheck } from 'lucide-react'
import { getDiplomaStats } from '@/lib/admin-stats'
import { DiplomasChart } from '@/components/admin/diplomas-chart'
import { DiplomasTable } from '@/components/admin/diplomas-table'

export const revalidate = 0

export const metadata = {
    title: 'Diplomas | Hub Admin',
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export default async function DiplomasPage() {
    const stats = await getDiplomaStats()

    const cards = [
        { label: 'Diplomas emitidos', value: stats.totalDiplomas, icon: Award },
        { label: 'Últimos 30 días', value: stats.diplomasLast30Days, icon: GraduationCap },
        { label: 'Vecinos cursando', value: stats.totalStudents, icon: Users },
        { label: 'Cursos con egresados', value: stats.coursesWithDiplomas, icon: BookOpenCheck },
    ]

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">
                    Diplomas y <span className="text-red-600">Certificaciones</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-2xl">
                    Cuántos diplomas se entregaron, a quiénes, y cómo viene el avance de cada curso.
                </p>
            </div>

            {/* Tarjetas resumen */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 relative overflow-hidden shadow-2xl shadow-red-950/20"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl -mr-12 -mt-12" />
                        <div className="flex flex-row items-center justify-between pb-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</h3>
                            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                                <Icon className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
                    </div>
                ))}
            </div>

            {/* Emisión por mes */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                    Diplomas por <span className="text-red-500">mes</span>
                </h2>
                <DiplomasChart data={stats.byMonth} />
            </div>

            {/* Avance por curso */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">
                    Avance por <span className="text-red-500">curso</span>
                </h2>
                <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-left">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Curso</th>
                                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Lecciones</th>
                                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Empezaron</th>
                                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Terminaron</th>
                                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Diplomas</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold w-48">Avance promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.courses.map((c) => (
                                    <tr key={c.slug} className="border-b border-white/5 last:border-0 hover:bg-red-600/5 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-200">{c.title}</td>
                                        <td className="px-4 py-4 text-right text-slate-400 font-mono">{c.lessons}</td>
                                        <td className="px-4 py-4 text-right text-slate-300 font-mono">{c.started}</td>
                                        <td className="px-4 py-4 text-right text-slate-300 font-mono">{c.finished}</td>
                                        <td className="px-4 py-4 text-right font-black text-red-500 font-mono">{c.diplomas}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-600 rounded-full"
                                                        style={{ width: `${c.avgProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400 w-9 text-right">{c.avgProgress}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {stats.courses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                                            Todavía no hay cursos cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Listado de diplomas */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">
                    Diplomas <span className="text-red-500">entregados</span>
                </h2>
                <DiplomasTable
                    diplomas={stats.diplomas.map((d) => ({ ...d, issuedAtLabel: formatDate(d.issuedAt) }))}
                />
            </div>
        </div>
    )
}
