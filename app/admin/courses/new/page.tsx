import { createCourse } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function NewCoursePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear Nuevo Curso</h1>
                    <p className="text-muted-foreground mt-2">Agrega un nuevo curso al catálogo de la plataforma.</p>
                </div>
                <Link href="/admin/courses">
                    <Button variant="outline">Volver</Button>
                </Link>
            </div>

            <form action={createCourse} className="space-y-8 bg-card p-8 rounded-xl border border-border/50">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Curso</Label>
                        <Input id="title" name="title" placeholder="Ej: Introducción a la Ingeniería Civil" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" name="category" placeholder="Ej: Estructuras" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo (Breve descripción)</Label>
                    <Input id="subtitle" name="subtitle" placeholder="Aprende los fundamentos del diseño estructural" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción Detallada</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe el contenido del curso y lo que aprenderán los estudiantes..."
                        className="min-h-[150px]"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="video_url">Enlace del Video (YouTube, Loom, etc.)</Label>
                    <Input id="video_url" name="video_url" type="url" placeholder="https://youtube.com/watch?v=..." />
                    <p className="text-xs text-muted-foreground">Opcional. Ingresa el enlace directo al video del curso.</p>
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-4">
                    <Button type="submit">Crear Curso</Button>
                    <Link href="/admin/courses">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
