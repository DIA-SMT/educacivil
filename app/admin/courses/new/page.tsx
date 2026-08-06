import { createCourse } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function NewCoursePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear Nuevo Curso</h1>
                    <p className="text-muted-foreground mt-2">
                        Con el título y la descripción alcanza. Después cargás las lecciones y el resto de los datos.
                    </p>
                </div>
                <Link href="/admin/courses">
                    <Button variant="outline">Volver</Button>
                </Link>
            </div>

            <form action={createCourse} className="space-y-8 bg-card p-8 rounded-xl border border-border/50">
                <div className="space-y-2">
                    <Label htmlFor="title">Título del Curso</Label>
                    <Input id="title" name="title" placeholder="Ej: Alfabetización Digital para Vecinos" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">¿De qué se trata?</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Contale al vecino qué va a aprender y para qué le sirve."
                        className="min-h-[120px]"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="thumbnail">Imagen de portada</Label>
                    <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
                    <p className="text-xs text-muted-foreground">Opcional. Se puede cargar o cambiar después.</p>
                </div>

                <details className="group rounded-lg border border-border/50 bg-secondary/10 p-4">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                        Opciones adicionales
                    </summary>

                    <div className="grid gap-4 md:grid-cols-2 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input id="category" name="category" placeholder="Ej: Ciudadanía digital" />
                            <p className="text-xs text-muted-foreground">Sirve para filtrar en el catálogo. Por defecto: General.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtítulo</Label>
                            <Input id="subtitle" name="subtitle" placeholder="Una línea que acompaña al título" />
                        </div>
                    </div>
                </details>

                <div className="pt-4 border-t border-border/50 flex gap-4">
                    <Button type="submit">Crear y cargar lecciones</Button>
                    <Link href="/admin/courses">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
