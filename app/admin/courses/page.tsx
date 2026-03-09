import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteCourse } from '../actions'

export const revalidate = 0

export default async function AdminCoursesPage() {
    const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Cursos</h1>
                    <p className="text-muted-foreground mt-2">Gestiona el catálogo de cursos de la plataforma.</p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                    Nuevo Curso
                </Link>
            </div>

            <div className="grid gap-6">
                {courses?.map((course) => (
                    <details key={course.id} className="group p-6 rounded-xl border border-border/50 bg-card open:ring-1 open:ring-border">
                        <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {course.title}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                                </h3>
                                <p className="text-sm text-primary mb-2">/{course.slug}</p>
                                <p className="text-muted-foreground">{course.subtitle}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                                {course.category}
                            </span>
                        </summary>

                        <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                            <Link
                                href={`/admin/courses/${course.id}`}
                                className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Editar Curso
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
