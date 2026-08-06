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
import { getVideoKind, getVideoThumbnail, normalizeVideoUrl, VIDEO_KIND_LABEL } from '@/lib/video'
import { Plus, Trash, Edit, GripVertical, Loader2, Upload, FileText, Link2, HelpCircle, Check, AlertTriangle, ChevronRight, Layers, List, Video, VideoOff } from 'lucide-react'

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
    /** Texto del botón de confirmación. Por defecto "Eliminar". */
    confirmLabel?: string
    onConfirm: () => void
}

/**
 * Estado del video de una lección, en una línea. De un vistazo se ve cuáles
 * quedaron sin cargar en vez de tener que abrir el editor de cada una.
 */
function LessonVideoSummary({ url }: { url: string }) {
    if (!url?.trim()) {
        return (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                <VideoOff className="w-3.5 h-3.5" />
                Sin video — es una lección de lectura
            </span>
        )
    }

    const kind = getVideoKind(url)
    if (kind === 'unknown') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                Enlace no reconocido: no se va a reproducir
            </span>
        )
    }

    return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Video className="w-3.5 h-3.5 text-emerald-500" />
            {VIDEO_KIND_LABEL[kind]}
        </span>
    )
}

/**
 * Muestra si el link pegado es reproducible por el aula, con miniatura cuando
 * es de YouTube. Antes no había ninguna señal: se guardaba cualquier cosa y el
 * error recién aparecía del lado público, como un recuadro negro.
 */
function VideoUrlStatus({ url, saving }: { url: string; saving: boolean }) {
    const trimmed = url.trim()
    if (!trimmed) return null

    const kind = getVideoKind(trimmed)
    const thumb = getVideoThumbnail(trimmed)

    if (kind === 'unknown') {
        return (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    No reconocemos este enlace: el aula no va a poder reproducirlo. Usá un link de
                    YouTube, Vimeo, Loom o Google&nbsp;Drive, o subí el archivo .mp4.
                </p>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="w-20 h-11 object-cover rounded shrink-0" />
            ) : (
                <div className="w-20 h-11 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {VIDEO_KIND_LABEL[kind]} — se reproduce en el aula
                </p>
                {kind === 'youtube' && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        El video debe estar en <strong>Público</strong> o <strong>No listado</strong>.
                        Los videos <strong>Privados</strong> de YouTube no se pueden incrustar.
                    </p>
                )}
            </div>
        </div>
    )
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

    // Los módulos son opcionales: la mayoría de los cursos son una lista simple
    // de lecciones. Se muestran sólo si el curso ya tiene más de uno, o si el
    // admin activa el agrupado a mano.
    const [forceGrouped, setForceGrouped] = useState(false)
    const grouped = forceGrouped || modules.length > 1
    const allLessons = modules.flatMap((m) => m.lessons ?? [])

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
    // `dirty` marca que el draft tiene cambios sin persistir. Antes se podía
    // pegar un link, cerrar el editor y perderlo sin ningún aviso: así fue como
    // varias lecciones quedaron con video_url vacío.
    const [dirty, setDirty] = useState(false)

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
        setDirty(false)
    }

    const closeLessonEditor = () => {
        setEditingLessonId(null)
        setDirty(false)
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

    /**
     * En modo lista simple no hay UI de módulos, pero el esquema los exige
     * (lessons.module_id). Si el curso no tiene ninguno, creamos uno invisible
     * al vuelo para poder colgar la primera lección.
     */
    const ensureDefaultModule = async (): Promise<string | null> => {
        if (modules.length > 0) return modules[0].id
        const res = await createModule(courseId, 'Módulo 1', 1)
        if (res?.error || !res?.data) {
            toast.error('No se pudo preparar el curso: ' + (res?.error ?? ''))
            return null
        }
        setModules([{ ...res.data, course_id: courseId, lessons: [] } as Module])
        return res.data.id
    }

    /** Abre el formulario de nueva lección, creando el módulo por detrás si hace falta. */
    const handleStartAddLesson = (moduleId?: string) => {
        if (moduleId) { setAddingLessonTo(moduleId); return }
        startTransition(async () => {
            const id = await ensureDefaultModule()
            if (id) setAddingLessonTo(id)
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

    /**
     * Persiste el draft. `closeAfter` distingue el botón "Guardar" (cierra el
     * editor) del auto-guardado al pegar un link (se queda abierto).
     */
    const persistLesson = async (
        next: LessonDraft,
        { closeAfter = false, silent = false }: { closeAfter?: boolean; silent?: boolean } = {}
    ) => {
        if (!editingLessonId || !next.title.trim()) return false
        setSavingLesson(true)
        try {
            const res = await updateLesson(editingLessonId, courseId, {
                title: next.title.trim(),
                duration: next.duration,
                // Guardamos la URL canónica: sin listas "mix" de YouTube pegadas
                // al copiar el link, que hacían arrancar una playlist ajena.
                video_url: normalizeVideoUrl(next.video_url),
                description: next.description,
                position: editingLesson?.position ?? 0,
            })
            if (res?.error) {
                toast.error('No se pudo guardar: ' + res.error)
                return false
            }
            setDirty(false)
            if (closeAfter) closeLessonEditor()
            router.refresh()
            if (!silent) toast.success('Lección guardada')
            return true
        } finally {
            setSavingLesson(false)
        }
    }

    const handleSaveLesson = () => {
        if (!editingLessonId || !draft.title.trim()) {
            toast.error('La lección necesita un título antes de guardarse')
            return
        }
        startTransition(() => { void persistLesson(draft, { closeAfter: true }) })
    }

    /**
     * Auto-guardado del campo de video: se dispara al salir del input o al
     * apretar Enter, para que pegar un link alcance (que es lo que dice el
     * texto de ayuda y lo que todo el mundo espera).
     */
    const handleVideoUrlCommit = () => {
        if (!editingLessonId || !dirty) return
        const normalized = normalizeVideoUrl(draft.video_url)
        const original = editingLesson?.video_url ?? ''
        // Si el video no cambió no guardamos, y tampoco limpiamos `dirty`: puede
        // haber cambios pendientes en el título o el resumen.
        if (normalized === original) return
        if (!draft.title.trim()) return   // sin título el guardado no aplica; lo avisa el botón

        const next = { ...draft, video_url: normalized }
        setDraft(next)
        startTransition(async () => {
            const ok = await persistLesson(next, { silent: true })
            if (ok) {
                toast.success(normalized ? 'Video vinculado a la lección' : 'Video quitado de la lección')
            }
        })
    }

    const handleCloseLessonEditor = () => {
        if (!dirty) { closeLessonEditor(); return }
        askConfirm({
            title: 'Cerrar sin guardar',
            description: 'Tenés cambios sin guardar en esta lección (título, video o descripción). Si cerrás ahora se pierden.',
            confirmLabel: 'Cerrar sin guardar',
            onConfirm: () => closeLessonEditor(),
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
            setDirty(false)
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
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        {grouped ? 'Contenido del Curso' : 'Lecciones del Curso'}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Cada lección lleva un video y, si querés, una descripción.
                        {grouped ? ' Las lecciones se agrupan en módulos.' : ' Se muestran al vecino en este orden.'}
                    </p>
                </div>
                {grouped && !addingModule && (
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
                {allLessons.length === 0 && !addingModule && (
                    <div className="rounded-xl border border-dashed border-border bg-secondary/10 p-8 text-center">
                        <p className="text-sm font-medium text-foreground">Todavía no hay lecciones</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                            Cargá la primera: le ponés un título, pegás el link del video y listo.
                        </p>
                        <Button onClick={() => handleStartAddLesson()} disabled={isPending} className="gap-2">
                            <Plus className="w-4 h-4" /> Crear primera lección
                        </Button>
                    </div>
                )}
                {modules.map((module) => (
                    <div
                        key={module.id}
                        className={cn(grouped && 'rounded-xl border border-border bg-card overflow-hidden')}
                    >
                        {/* Module Header — no se renderiza en modo lista simple.
                            Ocultarlo por CSS dejaba sus botones en el DOM: seguian
                            siendo alcanzables con Tab y disparaban acciones invisibles. */}
                        {grouped && (
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
                        )}

                        {/* Lessons List */}
                        <div className={cn(
                            'divide-y divide-border/50',
                            !grouped && 'rounded-xl border border-border bg-card overflow-hidden'
                        )}>
                            {module.lessons?.map((lesson) => (
                                <div key={lesson.id} className={cn(
                                    'p-4 flex items-start justify-between group/lesson hover:bg-secondary/10 transition-colors',
                                    grouped ? 'pl-12' : 'pl-4'
                                )}>
                                    {editingLessonId === lesson.id ? (
                                        <div className="flex-1 space-y-4 pr-4">
                                            <div className="space-y-2">
                                                <Label>Título de la lección</Label>
                                                <Input
                                                    value={draft.title}
                                                    onChange={(e) => { setDraft({ ...draft, title: e.target.value }); setDirty(true) }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Video de la lección</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={draft.video_url}
                                                        onChange={(e) => { setDraft({ ...draft, video_url: e.target.value }); setDirty(true) }}
                                                        onBlur={handleVideoUrlCommit}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleVideoUrlCommit() } }}
                                                        placeholder="Pegá el link de YouTube (o subí un archivo ➔)"
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

                                                <VideoUrlStatus url={draft.video_url} saving={savingLesson} />

                                                <p className="text-xs text-muted-foreground">
                                                    Pegá el link y salí del campo (o apretá Enter): se guarda solo. Los .mp4 se suben y se guardan al elegirlos.
                                                </p>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                                                <div className="space-y-2">
                                                    <Label>Resumen de la lección</Label>
                                                    <Textarea
                                                        value={draft.description}
                                                        onChange={(e) => { setDraft({ ...draft, description: e.target.value }); setDirty(true) }}
                                                        placeholder="Lo que el vecino va a ver en la pestaña “Resumen” del aula."
                                                        className="min-h-[80px] text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Duración</Label>
                                                    <Input
                                                        value={draft.duration}
                                                        onChange={(e) => { setDraft({ ...draft, duration: e.target.value }); setDirty(true) }}
                                                        placeholder="12:30"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground">Se completa sola al subir un .mp4.</p>
                                                </div>
                                            </div>

                                            {/* Resources Management UI — plegado: la mayoría de las
                                                lecciones son sólo video. */}
                                            <details className="pt-4 border-t border-border/50 group/adv">
                                                <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                                    <ChevronRight className="w-4 h-4 transition-transform group-open/adv:rotate-90" />
                                                    Material descargable
                                                    <span className="text-xs font-normal">({editingLesson?.resources?.length ?? 0})</span>
                                                </summary>

                                                <div className="space-y-4 pt-4">
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
                                            </details>

                                            {/* Quiz Management UI — también plegado. */}
                                            <details className="pt-4 border-t border-border/50 group/quiz">
                                                <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                                    <ChevronRight className="w-4 h-4 transition-transform group-open/quiz:rotate-90" />
                                                    <HelpCircle className="w-4 h-4" />
                                                    Cuestionario
                                                    <span className="text-xs font-normal">
                                                        ({editingLesson?.lesson_quizzes?.[0]
                                                            ? `${editingLesson.lesson_quizzes[0].quiz_questions?.length ?? 0} preguntas`
                                                            : 'sin crear'})
                                                    </span>
                                                </summary>

                                                <div className="space-y-4 pt-4">
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
                                            </details>

                                            <div className="flex gap-2 pt-2 items-center">
                                                <Button size="sm" onClick={handleSaveLesson} disabled={isPending || savingLesson}>
                                                    {savingLesson && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                                                    Guardar Cambios de Lección
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCloseLessonEditor}>Cerrar Editor</Button>
                                                {dirty && (
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Tenés cambios sin guardar
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex items-start gap-3 min-w-0">
                                                <span className="w-6 h-6 shrink-0 rounded-md bg-secondary text-muted-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                                                    {allLessons.findIndex((l) => l.id === lesson.id) + 1}
                                                </span>
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-sm text-foreground">{lesson.title}</span>
                                                        {lesson.duration && lesson.duration !== '0:00' && (
                                                            <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 rounded">{lesson.duration}</span>
                                                        )}
                                                    </div>
                                                    <LessonVideoSummary url={lesson.video_url} />
                                                </div>
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

                            {grouped && (!module.lessons || module.lessons.length === 0) && addingLessonTo !== module.id && (
                                <p className="px-4 pl-12 pt-3 text-xs text-muted-foreground italic">
                                    Este módulo no tiene lecciones. Agregá la primera abajo 👇
                                </p>
                            )}

                            {addingLessonTo === module.id ? (
                                <div className={cn('p-4 bg-secondary/5 flex items-end gap-4', grouped ? 'pl-12' : 'pl-4')}>
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
                            ) : (module.lessons && module.lessons.length > 0) || grouped ? (
                                <div className={cn('p-3', grouped ? 'pl-12' : 'pl-4')}>
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
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            {/* Los módulos son opcionales: se ofrecen, no se imponen. */}
            {!grouped && allLessons.length > 0 && (
                <button
                    type="button"
                    onClick={() => setForceGrouped(true)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Layers className="w-3.5 h-3.5" />
                    Agrupar las lecciones en módulos
                </button>
            )}
            {grouped && modules.length <= 1 && (
                <button
                    type="button"
                    onClick={() => setForceGrouped(false)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <List className="w-3.5 h-3.5" />
                    Volver a la lista simple de lecciones
                </button>
            )}

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
                            {confirm?.confirmLabel ?? 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
