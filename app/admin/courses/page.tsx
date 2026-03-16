import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteCourse } from '../actions'

export const revalidate = 0

export default async function AdminCoursesPage() {
    const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Gestión de <span className="text-red-600">Cursos</span></h1>
                    <p className="text-slate-500 mt-2 text-sm">Administra el catálogo de contenidos educativos de la plataforma.</p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 active:scale-[0.98]"
                >
                    + Nuevo Curso
                </Link>
            </div>

            <div className="grid gap-6">
                {courses?.map((course) => (
                    <details key={course.id} className="group p-8 rounded-[2rem] border border-red-500/10 bg-red-500/5 backdrop-blur-sm open:ring-1 open:ring-red-500/30 open:bg-red-500/10 transition-all duration-300">
                        <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 transition-transform group-open:rotate-180 text-red-500"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                    <span className="text-red-600/70">/{course.slug}</span>
                                    <span>•</span>
                                    <span>{course.category}</span>
                                </div>
                                <p className="text-slate-400 mt-3 text-sm line-clamp-2 max-w-2xl">{course.subtitle}</p>
                            </div>
                        </summary>

                        <div className="mt-8 pt-8 border-t border-white/5 flex gap-4 items-center">
                            <Link
                                href={`/admin/courses/${course.id}`}
                                className="text-sm px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
                            >
                                Configurar Contenido
                            </Link>

                            <DeleteButton
                                id={course.id}
                                itemName={course.title}
                                onDelete={deleteCourse}
                            />
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}
