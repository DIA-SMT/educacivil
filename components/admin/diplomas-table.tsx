'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Download, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type DiplomaRowView = {
    id: string
    certificateCode: string
    issuedAt: string
    issuedAtLabel: string
    studentName: string
    courseTitle: string
    courseSlug: string
    dni: string | null
    email: string | null
}

/** Escapa un valor para CSV (comillas dobles + separador). */
function csvCell(value: string | null) {
    const v = (value ?? '').replace(/"/g, '""')
    return `"${v}"`
}

export function DiplomasTable({ diplomas }: { diplomas: DiplomaRowView[] }) {
    const [query, setQuery] = useState('')
    const [course, setCourse] = useState('todos')

    const courses = useMemo(() => {
        const map = new Map<string, string>()
        for (const d of diplomas) map.set(d.courseSlug, d.courseTitle)
        return [...map.entries()]
    }, [diplomas])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return diplomas.filter((d) => {
            if (course !== 'todos' && d.courseSlug !== course) return false
            if (!q) return true
            return (
                d.studentName.toLowerCase().includes(q) ||
                (d.dni ?? '').includes(q) ||
                (d.email ?? '').toLowerCase().includes(q) ||
                d.certificateCode.toLowerCase().includes(q)
            )
        })
    }, [diplomas, query, course])

    const downloadCsv = () => {
        const header = ['Nombre', 'DNI', 'Email', 'Curso', 'Fecha de emisión', 'Código']
        const rows = filtered.map((d) => [
            csvCell(d.studentName),
            csvCell(d.dni),
            csvCell(d.email),
            csvCell(d.courseTitle),
            csvCell(d.issuedAtLabel),
            csvCell(d.certificateCode),
        ].join(';'))

        // BOM para que Excel en español abra los acentos bien.
        const csv = '﻿' + [header.map(csvCell).join(';'), ...rows].join('\r\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `diplomas-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por nombre, DNI, email o código..."
                        className="pl-9 bg-black/40 border-white/10 text-slate-200"
                    />
                </div>

                <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="h-9 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-slate-200"
                >
                    <option value="todos">Todos los cursos</option>
                    {courses.map(([slug, title]) => (
                        <option key={slug} value={slug}>{title}</option>
                    ))}
                </select>

                <Button onClick={downloadCsv} disabled={filtered.length === 0} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </Button>
            </div>

            <p className="text-xs text-slate-500">
                Mostrando {filtered.length} de {diplomas.length} diplomas.
            </p>

            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-left">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Vecino</th>
                                <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">DNI</th>
                                <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Curso</th>
                                <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Emitido</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Código</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((d) => (
                                <tr key={d.id} className="border-b border-white/5 last:border-0 hover:bg-red-600/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-200">{d.studentName}</div>
                                        {d.email && <div className="text-xs text-slate-500">{d.email}</div>}
                                    </td>
                                    <td className="px-4 py-4 font-mono text-slate-400">{d.dni ?? '—'}</td>
                                    <td className="px-4 py-4 text-slate-300">{d.courseTitle}</td>
                                    <td className="px-4 py-4 font-mono text-slate-400 whitespace-nowrap">{d.issuedAtLabel}</td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/certificates/${d.certificateCode}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 font-mono text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            {d.certificateCode}
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                                        {diplomas.length === 0
                                            ? 'Todavía no se emitió ningún diploma.'
                                            : 'Ningún diploma coincide con la búsqueda.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
