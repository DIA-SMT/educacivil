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
                lessons (*)
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

                <div className="space-y-2">
                    <Label htmlFor="video_url">Enlace del Video (YouTube, Loom, etc.)</Label>
                    <Input id="video_url" name="video_url" type="url" defaultValue={course.video_url || ''} placeholder="https://youtube.com/watch?v=..." />
                    <p className="text-xs text-muted-foreground">Opcional. Ingresa el enlace directo al video del curso.</p>
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
