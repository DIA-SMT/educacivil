import { supabase } from '@/lib/supabase'
import { updateCourse } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CourseContentManager } from '@/components/admin/course-content-manager'

export const revalidate = 0

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: course } = await supabase
        .from('courses')
        .select(`
            *,
            modules (
                *,
                lessons (
                    *,
                    resources (*),
                    lesson_quizzes (
                        *,
                        quiz_questions (*)
                    )
                )
            )
        `)
        .eq('id', id)
        .single()

    if (!course) {
        notFound()
    }

    // Sort modules and lessons by position
    const sortedModules = (course.modules || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((mod: any) => ({
            ...mod,
            lessons: (mod.lessons || []).sort((a: any, b: any) => a.position - b.position)
        }))

    const updateCourseWithId = updateCourse.bind(null, id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Curso</h1>
                    <p className="text-muted-foreground mt-2">Gestiona la información principal del curso.</p>
                </div>
                <Link href="/admin/courses">
                    <Button variant="outline">Volver</Button>
                </Link>
            </div>

            <form action={updateCourseWithId} className="space-y-8 bg-card p-8 rounded-xl border border-border/50">
                <input type="hidden" name="slug" value={course.slug} />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Curso</Label>
                        <Input id="title" name="title" defaultValue={course.title} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" name="category" defaultValue={course.category} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Input id="subtitle" name="subtitle" defaultValue={course.subtitle} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={course.description}
                        className="min-h-[150px]"
                        required
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="level">Nivel</Label>
                        <select
                            id="level"
                            name="level"
                            defaultValue={course.level || 'Principiante'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor / Docente</Label>
                        <Input id="instructor" name="instructor" defaultValue={course.instructor || ''} placeholder="Ej: Juan Pérez" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="badge">Etiqueta destacada</Label>
                        <select
                            id="badge"
                            name="badge"
                            defaultValue={course.badge || ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Ninguna</option>
                            <option value="Nuevo">Nuevo</option>
                            <option value="Popular">Popular</option>
                            <option value="Destacado">Destacado</option>
                        </select>
                        <p className="text-xs text-muted-foreground">Aparece como insignia sobre la portada.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="video_url">Video de presentación (YouTube, Loom, etc.)</Label>
                        <Input id="video_url" name="video_url" type="url" defaultValue={course.video_url || ''} placeholder="https://youtube.com/watch?v=..." />
                        <p className="text-xs text-muted-foreground">Opcional. Es el video introductorio que se muestra en la portada del curso.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración total estimada</Label>
                        <Input id="duration" name="duration" defaultValue={course.duration || ''} placeholder="Ej: 3h 30min" />
                        <p className="text-xs text-muted-foreground">Cargala al final, cuando ya tengas todas las lecciones. Se muestra en el catálogo.</p>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="thumbnail">Imagen de Portada</Label>
                        {course.thumbnail && course.thumbnail !== '/placeholder.jpg' && (
                            <div className="relative w-40 h-24 mb-3 rounded-md overflow-hidden border border-border">
                                <img src={course.thumbnail} alt="Thumbnail actual" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
                        <p className="text-xs text-muted-foreground">Sube una nueva imagen para reemplazar la actual (opcional).</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-4">
                    <Button type="submit">Guardar Cambios</Button>
                    <Link href="/admin/courses">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </form>

            <CourseContentManager courseId={course.id} initialModules={sortedModules} />
        </div>
    )
}
