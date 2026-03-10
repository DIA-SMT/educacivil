'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash, Edit, X, Save, GripVertical } from 'lucide-react'
import { createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson } from '@/app/admin/actions'

type Lesson = {
    id: string
    module_id: string
    title: string
    duration: string
    video_url: string
    description: string
    position: number
}

type Module = {
    id: string
    course_id: string
    title: string
    position: number
    lessons: Lesson[]
}

export function CourseContentManager({ courseId, initialModules }: { courseId: string, initialModules: Module[] }) {
    const [modules, setModules] = useState<Module[]>(initialModules)
    const [isPending, startTransition] = useTransition()

    // Forms state
    const [addingModule, setAddingModule] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState('')

    const [editingModule, setEditingModule] = useState<Module | null>(null)

    const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
    const [newLessonTitle, setNewLessonTitle] = useState('')

    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

    // Module Handlers
    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return
        startTransition(async () => {
            const position = modules.length + 1
            await createModule(courseId, newModuleTitle, position)
            setAddingModule(false)
            setNewModuleTitle('')
            // Need to reload? It's done via revalidatePath, but we only see it if we navigate or the page refreshed. 
            // Wait, revalidatePath doesn't automatically trigger client refresh unless we are using a Server Component that wraps this. 
            // We will let the parent Server Component re-fetch by doing a hard refresh or relying on Next.js auto-refresh from revalidatePath.
            // A simple `window.location.reload()` works if Next.js hydration doesn't pick it up fast enough.
            window.location.reload()
        })
    }

    const handleUpdateModule = () => {
        if (!editingModule || !editingModule.title.trim()) return
        startTransition(async () => {
            await updateModule(editingModule.id, courseId, editingModule.title, editingModule.position)
            setEditingModule(null)
            window.location.reload()
        })
    }

    const handleDeleteModule = (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este módulo?')) return
        startTransition(async () => {
            await deleteModule(id, courseId)
            window.location.reload()
        })
    }

    // Lesson Handlers
    const handleAddLesson = (moduleId: string) => {
        if (!newLessonTitle.trim()) return
        startTransition(async () => {
            const module = modules.find(m => m.id === moduleId)
            const position = module ? module.lessons.length + 1 : 1
            await createLesson(moduleId, courseId, newLessonTitle, position)
            setAddingLessonTo(null)
            setNewLessonTitle('')
            window.location.reload()
        })
    }

    const handleUpdateLesson = () => {
        if (!editingLesson || !editingLesson.title.trim()) return
        startTransition(async () => {
            await updateLesson(editingLesson.id, courseId, {
                title: editingLesson.title,
                duration: editingLesson.duration,
                video_url: editingLesson.video_url,
                description: editingLesson.description,
                position: editingLesson.position,
            })
            setEditingLesson(null)
            window.location.reload()
        })
    }

    const handleDeleteLesson = (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta lección?')) return
        startTransition(async () => {
            await deleteLesson(id, courseId)
            window.location.reload()
        })
    }

    return (
        <div className="space-y-6 mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Contenido del Curso</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Gestiona los módulos y lecciones de este curso.</p>
                </div>
                {!addingModule && (
                    <Button onClick={() => setAddingModule(true)} disabled={isPending} className="gap-2">
                        <Plus className="w-4 h-4" /> Agregar Módulo
                    </Button>
                )}
            </div>

            {addingModule && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="m_title">Título del Nuevo Módulo</Label>
                        <Input
                            id="m_title"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="Ej: Introducción"
                            autoFocus
                        />
                    </div>
                    <Button onClick={handleAddModule} disabled={isPending || !newModuleTitle.trim()}>
                        Guardar
                    </Button>
                    <Button variant="ghost" onClick={() => setAddingModule(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {modules.length === 0 && !addingModule && (
                    <p className="text-sm text-muted-foreground italic">No hay módulos creados aún.</p>
                )}
                {modules.map((module) => (
                    <div key={module.id} className="rounded-xl border border-border bg-card overflow-hidden">
                        {/* Module Header */}
                        <div className="bg-secondary/30 p-4 flex items-center justify-between group">
                            {editingModule?.id === module.id ? (
                                <div className="flex-1 flex items-center gap-4">
                                    <Input
                                        value={editingModule.title}
                                        onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={handleUpdateModule} disabled={isPending}>Guardar</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingModule(null)}>Cancelar</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-50" />
                                        <h3 className="font-semibold text-foreground">{module.title}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                            {module.lessons?.length || 0} lecciones
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingModule(module)} disabled={isPending}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteModule(module.id)} disabled={isPending}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Lessons List */}
                        <div className="divide-y divide-border/50">
                            {module.lessons?.map((lesson) => (
                                <div key={lesson.id} className="p-4 pl-12 flex items-start justify-between group/lesson hover:bg-secondary/10 transition-colors">
                                    {editingLesson?.id === lesson.id ? (
                                        <div className="flex-1 space-y-4 pr-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Título de Lección</Label>
                                                    <Input
                                                        value={editingLesson.title}
                                                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Duración (ej: 14:22)</Label>
                                                    <Input
                                                        value={editingLesson.duration}
                                                        onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>URL del Video</Label>
                                                <Input
                                                    value={editingLesson.video_url || ''}
                                                    onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                                                    placeholder="YouTube / Loom link"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" onClick={handleUpdateLesson} disabled={isPending}>Guardar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)}>Cancelar</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">{lesson.title}</span>
                                                    <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 rounded">{lesson.duration || '0:00'}</span>
                                                </div>
                                                {lesson.video_url && (
                                                    <span className="text-xs text-blue-500 truncate max-w-sm">{lesson.video_url}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingLesson(lesson)} disabled={isPending}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending}>
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {addingLessonTo === module.id ? (
                                <div className="p-4 pl-12 bg-secondary/5 flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Título de la nueva lección</Label>
                                        <Input
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            placeholder="Ej: Introducción al tema"
                                            autoFocus
                                        />
                                    </div>
                                    <Button onClick={() => handleAddLesson(module.id)} disabled={isPending || !newLessonTitle.trim()}>
                                        Guardar
                                    </Button>
                                    <Button variant="ghost" onClick={() => setAddingLessonTo(null)} disabled={isPending}>
                                        Cancelar
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 pl-12">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground text-xs gap-1 h-8"
                                        onClick={() => { setAddingLessonTo(module.id); setNewLessonTitle(''); }}
                                        disabled={isPending || editingLesson !== null}
                                    >
                                        <Plus className="w-3 h-3" /> Agregar Lección
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
