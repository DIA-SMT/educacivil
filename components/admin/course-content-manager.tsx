'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
    createModule, updateModule, deleteModule, 
    createLesson, updateLesson, deleteLesson, 
    createResource, deleteResource,
    createQuiz, updateQuiz, deleteQuiz,
    addQuestion, updateQuestion, deleteQuestion
} from '@/app/admin/actions'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash, Edit, X, Save, GripVertical, Loader2, Upload, FileText, Link2, Download, HelpCircle, Check, AlertCircle } from 'lucide-react'

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
    const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null)
    const [uploadingResourceId, setUploadingResourceId] = useState<string | null>(null)

    // Resource Form State
    const [newResourceTitle, setNewResourceTitle] = useState('')
    const [newResourceType, setNewResourceType] = useState<'pdf' | 'link'>('pdf')
    const [newResourceUrl, setNewResourceUrl] = useState('')

    // Quiz Form State
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
    const [newQuestionText, setNewQuestionText] = useState('')
    const [newQuestionOptions, setNewQuestionOptions] = useState(['', '', '', ''])
    const [newQuestionCorrectIndex, setNewQuestionCorrectIndex] = useState(0)
    const [newQuestionExplanation, setNewQuestionExplanation] = useState('')

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

    const handleVideoUpload = async (file: File) => {
        if (!file || !editingLesson) return
        
        try {
            setUploadingVideoId(editingLesson.id)
            const supabase = createClient()
            
            // Generate a unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${courseId}/${fileName}`
            
            // Upload to Supabase Storage bucket 'videos'
            const { error: uploadError, data } = await supabase.storage
                .from('videos')
                .upload(filePath, file, { upsert: true })
                
            if (uploadError) throw uploadError
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(filePath)
                
            // Update the form state with the new URL
            setEditingLesson({ ...editingLesson, video_url: publicUrl })
            alert('Video subido correctamente. Recuerda presionar Guardar para aplicar los cambios.')
            
        } catch (error: any) {
            console.error('Error uploading video:', error)
            alert('Error al subir el video: ' + error.message)
        } finally {
            setUploadingVideoId(null)
        }
    }

    const handleResourceUpload = async (file: File) => {
        if (!file || !editingLesson) return
        
        try {
            setUploadingResourceId(editingLesson.id)
            const supabase = createClient()
            
            // Generate a unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${courseId}/${fileName}`
            
            // Upload to Supabase Storage bucket 'resources'
            const { error: uploadError, data } = await supabase.storage
                .from('resources')
                .upload(filePath, file, { upsert: true })
                
            if (uploadError) throw uploadError
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath)
                
            setNewResourceUrl(publicUrl)
            alert('PDF subido correctamente. Ahora presiona "Agregar Recurso".')
            
        } catch (error: any) {
            console.error('Error uploading resource:', error)
            alert('Error al subir el recurso: ' + error.message)
        } finally {
            setUploadingResourceId(null)
        }
    }

    const handleAddResource = () => {
        if (!editingLesson || !newResourceTitle.trim() || !newResourceUrl.trim()) return
        startTransition(async () => {
            const res = await createResource(editingLesson.id, courseId, newResourceTitle, newResourceType, newResourceUrl)
            if (res.success) {
                setNewResourceTitle('')
                setNewResourceUrl('')
                // Reload to see new resource
                window.location.reload()
            }
        })
    }

    const handleDeleteResource = (resourceId: string) => {
        if (!confirm('¿Estás seguro de eliminar este recurso?')) return
        startTransition(async () => {
            const res = await deleteResource(resourceId, courseId)
            if (res.success) {
                window.location.reload()
            }
        })
    }

    // Quiz Handlers
    const handleAddQuiz = (lessonId: string) => {
        const title = prompt('Título del Cuestionario:', 'Evaluación de conocimientos')
        if (!title) return
        startTransition(async () => {
            await createQuiz(lessonId, courseId, title)
            window.location.reload()
        })
    }

    const handleDeleteQuiz = (quizId: string) => {
        if (!confirm('¿Estás seguro de eliminar todo el cuestionario?')) return
        startTransition(async () => {
            await deleteQuiz(quizId, courseId)
            window.location.reload()
        })
    }

    const handleAddQuestion = (quizId: string) => {
        if (!newQuestionText.trim()) return
        startTransition(async () => {
            await addQuestion(quizId, courseId, {
                question_text: newQuestionText,
                options: newQuestionOptions.filter(o => o.trim() !== ''),
                correct_option_index: newQuestionCorrectIndex,
                explanation: newQuestionExplanation,
                position: 0 // Will be handled by DB or explicit later
            })
            setNewQuestionText('')
            setNewQuestionOptions(['', '', '', ''])
            setNewQuestionCorrectIndex(0)
            setNewQuestionExplanation('')
            window.location.reload()
        })
    }

    const handleDeleteQuestion = (questionId: string) => {
        if (!confirm('¿Eliminar esta pregunta?')) return
        startTransition(async () => {
            await deleteQuestion(questionId, courseId)
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
                                                <Label>URL del Video o Subir Archivo</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={editingLesson.video_url || ''}
                                                        onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                                                        placeholder="YouTube / Loom link o sube un archivo ➔"
                                                        className="flex-1"
                                                    />
                                                    <div className="relative overflow-hidden shrink-0">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={uploadingVideoId === editingLesson.id}
                                                            className="gap-2 relative z-10 pointer-events-none"
                                                        >
                                                            {uploadingVideoId === editingLesson.id ? (
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
                                                            disabled={uploadingVideoId === editingLesson.id}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Pega un link o selecciona un archivo .mp4 de tu PC que se guardará en la nube.</p>
                                            </div>

                                            {/* Resources Management UI */}
                                            <div className="space-y-4 pt-4 border-t border-border/50">
                                                <Label className="text-sm font-semibold">Recursos Descargables (PDFs, Links)</Label>
                                                
                                                {/* Existing Resources List */}
                                                <div className="space-y-2">
                                                    {editingLesson.resources?.map((res) => (
                                                        <div key={res.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/50">
                                                            <div className="flex items-center gap-2">
                                                                {res.type === 'link' ? <Link2 className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                                                                <span className="text-sm font-medium">{res.title}</span>
                                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{res.type}</span>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteResource(res.id)}>
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {(!editingLesson.resources || editingLesson.resources.length === 0) && (
                                                        <p className="text-xs text-muted-foreground italic">No hay recursos agregados.</p>
                                                    )}
                                                </div>

                                                {/* Add New Resource Form */}
                                                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Nombre del Recurso</Label>
                                                            <Input 
                                                                placeholder="Ej: Guía PDF" 
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
                                                                        disabled={uploadingResourceId === editingLesson.id}
                                                                        className="h-8 gap-2 relative z-10 pointer-events-none"
                                                                    >
                                                                        {uploadingResourceId === editingLesson.id ? (
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
                                                                        disabled={uploadingResourceId === editingLesson.id}
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
                                                    {!editingLesson.lesson_quizzes?.[0] ? (
                                                        <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => handleAddQuiz(editingLesson.id)}>
                                                            <Plus className="w-3.5 h-3.5" /> Crear Cuestionario
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" className="h-8 text-destructive gap-1" onClick={() => handleDeleteQuiz(editingLesson.lesson_quizzes![0].id)}>
                                                            <Trash className="w-3.5 h-3.5" /> Eliminar
                                                        </Button>
                                                    )}
                                                </div>

                                                {editingLesson.lesson_quizzes?.[0] && (
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
                                                <Button size="sm" onClick={handleUpdateLesson} disabled={isPending}>Guardar Cambios de Lección</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)}>Cerrar Editor</Button>
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
