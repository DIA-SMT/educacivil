'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
    AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
    createModule, updateModule, deleteModule,
    createLesson, updateLesson, deleteLesson,
    createResource, deleteResource,
    createQuiz, deleteQuiz,
    addQuestion, deleteQuestion
} from '@/app/admin/actions'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash, Edit, GripVertical, Loader2, Upload, FileText, Link2, HelpCircle, Check } from 'lucide-react'

type Resource = {
    id: string
    lesson_id: string
    title: string
    type: 'pdf' | 'doc' | 'link' | 'template'
    url: string
}

type Question = {
    id: string
    quiz_id: string
    question_text: string
    options: string[]
    correct_option_index: number
    explanation?: string
    position: number
}

type Quiz = {
    id: string
    lesson_id: string
    title: string
    description?: string
    quiz_questions: Question[]
}

type Lesson = {
    id: string
    module_id: string
    title: string
    duration: string
    video_url: string
    description: string
    position: number
    resources: Resource[]
    lesson_quizzes?: Quiz[]
}

type Module = {
    id: string
    course_id: string
    title: string
    position: number
    lessons: Lesson[]
}

type LessonDraft = {
    title: string
    duration: string
    video_url: string
    description: string
}

type ConfirmState = {
    title: string
    description: string
    onConfirm: () => void
}

// Format seconds into "m:ss" (or "h:mm:ss" for long videos).
function formatDuration(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return ''
    const total = Math.round(seconds)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
}

// Read a video file's duration locally (no upload needed) via a temp <video> element.
function readVideoDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
        try {
            const url = URL.createObjectURL(file)
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(url)
                resolve(formatDuration(video.duration))
            }
            video.onerror = () => { URL.revokeObjectURL(url); resolve('') }
            video.src = url
        } catch {
            resolve('')
        }
    })
}

export function CourseContentManager({ courseId, initialModules }: { courseId: string, initialModules: Module[] }) {
    const router = useRouter()
    const [modules, setModules] = useState<Module[]>(initialModules)
    const [isPending, startTransition] = useTransition()

    // Keep local state in sync whenever the server component re-fetches (router.refresh)
    useEffect(() => {
        setModules(initialModules)
    }, [initialModules])

    // Module forms state
    const [addingModule, setAddingModule] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState('')
    const [editingModule, setEditingModule] = useState<Module | null>(null)

    // Lesson forms state
    const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
    const [newLessonTitle, setNewLessonTitle] = useState('')

    // The lesson editor works on a draft for the text fields; resources & quizzes
    // are read live from `modules` so they update instantly after each action.
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
    const [draft, setDraft] = useState<LessonDraft>({ title: '', duration: '', video_url: '', description: '' })
    const [savingLesson, setSavingLesson] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingResource, setUploadingResource] = useState(false)

    const editingLesson = editingLessonId
        ? modules.flatMap(m => m.lessons).find(l => l.id === editingLessonId) ?? null
        : null

    // Resource Form State
    const [newResourceTitle, setNewResourceTitle] = useState('')
    const [newResourceType, setNewResourceType] = useState<'pdf' | 'link'>('pdf')
    const [newResourceUrl, setNewResourceUrl] = useState('')

    // Quiz / Question Form State
    const [newQuestionText, setNewQuestionText] = useState('')
    const [newQuestionOptions, setNewQuestionOptions] = useState(['', '', '', ''])
    const [newQuestionCorrectIndex, setNewQuestionCorrectIndex] = useState(0)
    const [newQuestionExplanation, setNewQuestionExplanation] = useState('')

    // Confirm dialog
    const [confirm, setConfirm] = useState<ConfirmState | null>(null)
    const askConfirm = (state: ConfirmState) => setConfirm(state)

    const openLessonEditor = (lesson: Pick<Lesson, 'id' | 'title' | 'duration' | 'video_url' | 'description'>) => {
        setEditingLessonId(lesson.id)
        setDraft({
            title: lesson.title,
            duration: lesson.duration || '',
            video_url: lesson.video_url || '',
            description: lesson.description || '',
        })
    }

    const closeLessonEditor = () => {
        setEditingLessonId(null)
        setNewResourceTitle('')
        setNewResourceUrl('')
        setNewResourceType('pdf')
    }

    // ----------------------------- Module Handlers -----------------------------
    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return
        startTransition(async () => {
            const position = modules.length + 1
            const res = await createModule(courseId, newModuleTitle.trim(), position)
            if (res?.error) { toast.error('No se pudo crear el módulo: ' + res.error); return }
            setAddingModule(false)
            setNewModuleTitle('')
            router.refresh()
            toast.success('Módulo creado')
        })
    }

    const handleUpdateModule = () => {
        if (!editingModule || !editingModule.title.trim()) return
        startTransition(async () => {
            const res = await updateModule(editingModule.id, courseId, editingModule.title.trim(), editingModule.position)
            if (res?.error) { toast.error('No se pudo guardar: ' + res.error); return }
            setEditingModule(null)
            router.refresh()
            toast.success('Módulo actualizado')
        })
    }

    const handleDeleteModule = (mod: Module) => {
        askConfirm({
            title: 'Eliminar módulo',
            description: `Se eliminará "${mod.title}" y todas sus lecciones, recursos y cuestionarios. Esta acción no se puede deshacer.`,
            onConfirm: () => startTransition(async () => {
                const res = await deleteModule(mod.id, courseId)
                if (res?.error) { toast.error('No se pudo eliminar: ' + res.error); return }
                if (editingLesson?.module_id === mod.id) closeLessonEditor()
                router.refresh()
                toast.success('Módulo eliminado')
            }),
        })
    }

    // ----------------------------- Lesson Handlers -----------------------------
    const handleAddLesson = (moduleId: string) => {
        if (!newLessonTitle.trim()) return
        const title = newLessonTitle.trim()
        startTransition(async () => {
            const module = modules.find(m => m.id === moduleId)
            const position = module ? module.lessons.length + 1 : 1
            const res = await createLesson(moduleId, courseId, title, position)
            if (res?.error || !res?.data) { toast.error('No se pudo crear la lección: ' + (res?.error ?? '')); return }

            // Optimistically insert so the editor can open immediately, then reconcile.
            const newLesson: Lesson = { ...res.data, resources: [], lesson_quizzes: [] }
            setModules(prev => prev.map(m =>
                m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
            ))
            setAddingLessonTo(null)
            setNewLessonTitle('')
            openLessonEditor(newLesson)   // open editor right away — no save-then-reenter
            router.refresh()
            toast.success('Lección creada. Cargá su contenido abajo.')
        })
    }

    const handleSaveLesson = () => {
        if (!editingLessonId || !draft.title.trim()) return
        setSavingLesson(true)
        startTransition(async () => {
            const res = await updateLesson(editingLessonId, courseId, {
                title: draft.title.trim(),
                duration: draft.duration,
                video_url: draft.video_url,
                description: draft.description,
                position: editingLesson?.position ?? 0,
            })
            setSavingLesson(false)
            if (res?.error) { toast.error('No se pudo guardar: ' + res.error); return }
            closeLessonEditor()
            router.refresh()
            toast.success('Lección guardada')
        })
    }

    const handleDeleteLesson = (lesson: Lesson) => {
        askConfirm({
            title: 'Eliminar lección',
            description: `Se eliminará "${lesson.title}" junto con sus recursos y cuestionario.`,
            onConfirm: () => startTransition(async () => {
                const res = await deleteLesson(lesson.id, courseId)
                if (res?.error) { toast.error('No se pudo eliminar: ' + res.error); return }
                if (editingLessonId === lesson.id) closeLessonEditor()
                router.refresh()
                toast.success('Lección eliminada')
            }),
        })
    }

    const handleVideoUpload = async (file: File) => {
        if (!file || !editingLessonId) return
        try {
            setUploadingVideo(true)
            const supabase = createClient()

            // Detect the real duration from the file itself.
            const detectedDuration = await readVideoDuration(file)

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${courseId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(filePath, file, { upsert: true })
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath)

            // Persist immediately — no separate "remember to save" step.
            const nextDraft = { ...draft, video_url: publicUrl, duration: detectedDuration || draft.duration }
            setDraft(nextDraft)
            const res = await updateLesson(editingLessonId, courseId, {
                title: nextDraft.title.trim() || 'Lección',
                duration: nextDraft.duration,
                video_url: publicUrl,
                description: nextDraft.description,
                position: editingLesson?.position ?? 0,
            })
            if (res?.error) { toast.error('Video subido pero no se pudo guardar: ' + res.error); return }
            router.refresh()
            toast.success(detectedDuration ? `Video subido y guardado (${detectedDuration})` : 'Video subido y guardado')
        } catch (error: any) {
            console.error('Error uploading video:', error)
            toast.error('Error al subir el video: ' + error.message)
        } finally {
            setUploadingVideo(false)
        }
    }

    // ----------------------------- Resource Handlers -----------------------------
    const handleResourceUpload = async (file: File) => {
        if (!file || !editingLessonId) return
        try {
            setUploadingResource(true)
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${courseId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resources')
                .upload(filePath, file, { upsert: true })
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath)

            const finalTitle = newResourceTitle.trim() || file.name.replace(/\.[^/.]+$/, '')
            const res = await createResource(editingLessonId, courseId, finalTitle, newResourceType, publicUrl)
            if (res?.error) { toast.error('Error al guardar el recurso: ' + res.error); return }
            setNewResourceTitle('')
            setNewResourceUrl('')
            router.refresh()
            toast.success('Recurso subido')
        } catch (error: any) {
            console.error('Error uploading resource:', error)
            toast.error('Error al subir el recurso: ' + error.message)
        } finally {
            setUploadingResource(false)
        }
    }

    const handleAddResource = () => {
        if (!editingLessonId || !newResourceTitle.trim() || !newResourceUrl.trim()) return
        startTransition(async () => {
            const res = await createResource(editingLessonId, courseId, newResourceTitle.trim(), newResourceType, newResourceUrl.trim())
            if (res?.error) { toast.error('Error al guardar el recurso: ' + res.error); return }
            setNewResourceTitle('')
            setNewResourceUrl('')
            router.refresh()
            toast.success('Recurso agregado')
        })
    }

    const handleDeleteResource = (resource: Resource) => {
        askConfirm({
            title: 'Eliminar recurso',
            description: `Se eliminará "${resource.title}".`,
            onConfirm: () => startTransition(async () => {
                const res = await deleteResource(resource.id, courseId)
                if (res?.error) { toast.error('No se pudo eliminar: ' + res.error); return }
                router.refresh()
                toast.success('Recurso eliminado')
            }),
        })
    }

    // ----------------------------- Quiz Handlers -----------------------------
    const handleAddQuiz = (lessonId: string) => {
        startTransition(async () => {
            const res = await createQuiz(lessonId, courseId, 'Evaluación de conocimientos')
            if (res?.error) { toast.error('No se pudo crear el cuestionario: ' + res.error); return }
            router.refresh()
            toast.success('Cuestionario creado')
        })
    }

    const handleDeleteQuiz = (quizId: string) => {
        askConfirm({
            title: 'Eliminar cuestionario',
            description: 'Se eliminará el cuestionario completo con todas sus preguntas.',
            onConfirm: () => startTransition(async () => {
                const res = await deleteQuiz(quizId, courseId)
                if (res?.error) { toast.error('No se pudo eliminar: ' + res.error); return }
                router.refresh()
                toast.success('Cuestionario eliminado')
            }),
        })
    }

    const handleAddQuestion = (quizId: string) => {
        if (!newQuestionText.trim()) return
        startTransition(async () => {
            const res = await addQuestion(quizId, courseId, {
                question_text: newQuestionText.trim(),
                options: newQuestionOptions.filter(o => o.trim() !== ''),
                correct_option_index: newQuestionCorrectIndex,
                explanation: newQuestionExplanation,
                position: 0,
            })
            if (res?.error) { toast.error('No se pudo agregar la pregunta: ' + res.error); return }
            setNewQuestionText('')
            setNewQuestionOptions(['', '', '', ''])
            setNewQuestionCorrectIndex(0)
            setNewQuestionExplanation('')
            router.refresh()
            toast.success('Pregunta agregada')
        })
    }

    const handleDeleteQuestion = (questionId: string) => {
        askConfirm({
            title: 'Eliminar pregunta',
            description: '¿Eliminar esta pregunta del cuestionario?',
            onConfirm: () => startTransition(async () => {
                const res = await deleteQuestion(questionId, courseId)
                if (res?.error) { toast.error('No se pudo eliminar: ' + res.error); return }
                router.refresh()
                toast.success('Pregunta eliminada')
            }),
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
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddModule() }}
                            placeholder="Ej: Introducción"
                            autoFocus
                        />
                    </div>
                    <Button onClick={handleAddModule} disabled={isPending || !newModuleTitle.trim()}>
                        Guardar
                    </Button>
                    <Button variant="ghost" onClick={() => { setAddingModule(false); setNewModuleTitle('') }} disabled={isPending}>
                        Cancelar
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {modules.length === 0 && !addingModule && (
                    <div className="rounded-xl border border-dashed border-border bg-secondary/10 p-8 text-center">
                        <p className="text-sm font-medium text-foreground">Todavía no hay módulos</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                            Empezá creando tu primer módulo para agrupar las lecciones del curso.
                        </p>
                        <Button onClick={() => setAddingModule(true)} className="gap-2">
                            <Plus className="w-4 h-4" /> Crear primer módulo
                        </Button>
                    </div>
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
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateModule() }}
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
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteModule(module)} disabled={isPending}>
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
                                    {editingLessonId === lesson.id ? (
                                        <div className="flex-1 space-y-4 pr-4">
                                            <div className="space-y-2">
                                                <Label>Título de Lección</Label>
                                                <Input
                                                    value={draft.title}
                                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>URL del Video o Subir Archivo</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={draft.video_url}
                                                        onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
                                                        placeholder="YouTube / Loom link o sube un archivo ➔"
                                                        className="flex-1"
                                                    />
                                                    <div className="relative overflow-hidden shrink-0">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={uploadingVideo}
                                                            className="gap-2 relative z-10 pointer-events-none"
                                                        >
                                                            {uploadingVideo ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-4 h-4" />
                                                            )}
                                                            Subir
                                                        </Button>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                                            disabled={uploadingVideo}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Pegá un link o seleccioná un archivo .mp4: se sube y se guarda solo.</p>
                                            </div>

                                            {/* Resources Management UI */}
                                            <div className="space-y-4 pt-4 border-t border-border/50">
                                                <Label className="text-sm font-semibold">Recursos Descargables (PDFs, Links)</Label>

                                                {/* Existing Resources List */}
                                                <div className="space-y-2">
                                                    {editingLesson?.resources?.map((res) => (
                                                        <div key={res.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/50">
                                                            <div className="flex items-center gap-2">
                                                                {res.type === 'link' ? <Link2 className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                                                                <span className="text-sm font-medium">{res.title}</span>
                                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{res.type}</span>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteResource(res)}>
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {(!editingLesson?.resources || editingLesson.resources.length === 0) && (
                                                        <p className="text-xs text-muted-foreground italic">No hay recursos agregados.</p>
                                                    )}
                                                </div>

                                                {/* Add New Resource Form */}
                                                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Nombre del Recurso</Label>
                                                            <Input
                                                                placeholder="Ej: Guía PDF (opcional al subir)"
                                                                value={newResourceTitle}
                                                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Tipo</Label>
                                                            <select
                                                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                value={newResourceType}
                                                                onChange={(e) => setNewResourceType(e.target.value as any)}
                                                            >
                                                                <option value="pdf">Archivo PDF</option>
                                                                <option value="link">Enlace Externo</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">URL o Subir Archivo</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder={newResourceType === 'pdf' ? "Sube un archivo o pega el link" : "https://..."}
                                                                value={newResourceUrl}
                                                                onChange={(e) => setNewResourceUrl(e.target.value)}
                                                                className="h-8 text-sm flex-1"
                                                            />
                                                            {newResourceType === 'pdf' && (
                                                                <div className="relative overflow-hidden shrink-0">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        disabled={uploadingResource}
                                                                        className="h-8 gap-2 relative z-10 pointer-events-none"
                                                                    >
                                                                        {uploadingResource ? (
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                        ) : (
                                                                            <Upload className="w-3 h-3" />
                                                                        )}
                                                                        Subir
                                                                    </Button>
                                                                    <input
                                                                        type="file"
                                                                        accept="application/pdf"
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                                        onChange={(e) => e.target.files?.[0] && handleResourceUpload(e.target.files[0])}
                                                                        disabled={uploadingResource}
                                                                    />
                                                                </div>
                                                            )}
                                                            <Button size="sm" onClick={handleAddResource} disabled={isPending || !newResourceTitle.trim() || !newResourceUrl.trim()}>
                                                                Agregar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quiz Management UI */}
                                            <div className="space-y-4 pt-4 border-t border-border/50">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                                        <HelpCircle className="w-4 h-4 text-primary" />
                                                        Cuestionario de Evaluación
                                                    </Label>
                                                    {!editingLesson?.lesson_quizzes?.[0] ? (
                                                        <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => handleAddQuiz(lesson.id)} disabled={isPending}>
                                                            <Plus className="w-3.5 h-3.5" /> Crear Cuestionario
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" className="h-8 text-destructive gap-1" onClick={() => handleDeleteQuiz(editingLesson.lesson_quizzes![0].id)} disabled={isPending}>
                                                            <Trash className="w-3.5 h-3.5" /> Eliminar
                                                        </Button>
                                                    )}
                                                </div>

                                                {editingLesson?.lesson_quizzes?.[0] && (
                                                    <div className="space-y-4">
                                                        <div className="glass-strong p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                                                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                                <Check className="w-3 h-3" /> Configuración de Preguntas
                                                            </h4>

                                                            {/* Questions List */}
                                                            <div className="space-y-2">
                                                                {editingLesson.lesson_quizzes[0].quiz_questions?.map((q, idx) => (
                                                                    <div key={q.id} className="p-3 rounded-lg bg-background border border-border flex items-start justify-between group">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium mb-1">{idx + 1}. {q.question_text}</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {q.options.map((opt, oIdx) => (
                                                                                    <span key={oIdx} className={cn("text-[10px] px-2 py-0.5 rounded border", oIdx === q.correct_option_index ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-secondary text-muted-foreground border-border")}>
                                                                                        {opt}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteQuestion(q.id)}>
                                                                            <Trash className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {(!editingLesson.lesson_quizzes[0].quiz_questions || editingLesson.lesson_quizzes[0].quiz_questions.length === 0) && (
                                                                    <p className="text-xs text-muted-foreground italic">No hay preguntas aún.</p>
                                                                )}
                                                            </div>

                                                            {/* Add Question Form */}
                                                            <div className="pt-4 border-t border-primary/10 space-y-3">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs">Nueva Pregunta</Label>
                                                                    <Input
                                                                        placeholder="Ej: ¿Qué significa IA?"
                                                                        value={newQuestionText}
                                                                        onChange={(e) => setNewQuestionText(e.target.value)}
                                                                        className="h-9 text-sm"
                                                                    />
                                                                </div>

                                                                <div className="grid gap-3 grid-cols-2">
                                                                    {newQuestionOptions.map((opt, idx) => (
                                                                        <div key={idx} className="space-y-1.5">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Opción {idx + 1}</Label>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setNewQuestionCorrectIndex(idx)}
                                                                                    className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", newQuestionCorrectIndex === idx ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-primary")}
                                                                                >
                                                                                    {newQuestionCorrectIndex === idx && <Check className="w-2.5 h-2.5" />}
                                                                                </button>
                                                                            </div>
                                                                            <Input
                                                                                placeholder={`Respuesta ${idx + 1}`}
                                                                                value={opt}
                                                                                onChange={(e) => {
                                                                                    const next = [...newQuestionOptions]
                                                                                    next[idx] = e.target.value
                                                                                    setNewQuestionOptions(next)
                                                                                }}
                                                                                className="h-8 text-sm"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label className="text-xs">Explicación (opcional)</Label>
                                                                    <Textarea
                                                                        placeholder="Explica por qué la respuesta es correcta para ayudar al alumno."
                                                                        value={newQuestionExplanation}
                                                                        onChange={(e) => setNewQuestionExplanation(e.target.value)}
                                                                        className="min-h-[60px] text-sm py-2"
                                                                    />
                                                                </div>

                                                                <Button
                                                                    size="sm"
                                                                    className="w-full gap-2"
                                                                    onClick={() => handleAddQuestion(editingLesson.lesson_quizzes![0].id)}
                                                                    disabled={isPending || !newQuestionText.trim() || newQuestionOptions.filter(o => o.trim()).length < 2}
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" /> Agregar Pregunta
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" onClick={handleSaveLesson} disabled={isPending || savingLesson}>
                                                    {savingLesson && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                                                    Guardar Cambios de Lección
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={closeLessonEditor}>Cerrar Editor</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">{lesson.title}</span>
                                                    {lesson.duration && lesson.duration !== '0:00' && (
                                                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 rounded">{lesson.duration}</span>
                                                    )}
                                                </div>
                                                {lesson.video_url && (
                                                    <span className="text-xs text-blue-500 truncate max-w-sm">{lesson.video_url}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openLessonEditor(lesson)} disabled={isPending}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteLesson(lesson)} disabled={isPending}>
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {(!module.lessons || module.lessons.length === 0) && addingLessonTo !== module.id && (
                                <p className="px-4 pl-12 pt-3 text-xs text-muted-foreground italic">
                                    Este módulo no tiene lecciones. Agregá la primera abajo 👇
                                </p>
                            )}

                            {addingLessonTo === module.id ? (
                                <div className="p-4 pl-12 bg-secondary/5 flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Título de la nueva lección</Label>
                                        <Input
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLesson(module.id) }}
                                            placeholder="Ej: Introducción al tema"
                                            autoFocus
                                        />
                                    </div>
                                    <Button onClick={() => handleAddLesson(module.id)} disabled={isPending || !newLessonTitle.trim()}>
                                        Crear y editar
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setAddingLessonTo(null); setNewLessonTitle('') }} disabled={isPending}>
                                        Cancelar
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 pl-12">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground text-xs gap-1 h-8"
                                        onClick={() => { setAddingLessonTo(module.id); setNewLessonTitle('') }}
                                        disabled={isPending || editingLessonId !== null}
                                    >
                                        <Plus className="w-3 h-3" /> Agregar Lección
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Reusable confirm dialog (replaces window.confirm) */}
            <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { confirm?.onConfirm(); setConfirm(null) }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
