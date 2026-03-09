import { supabase } from '@/lib/supabase'
import { updateAiGuide } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EditGuidePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: guide } = await supabase.from('ai_guides').select('*').eq('id', id).single()

    if (!guide) {
        notFound()
    }

    const updateGuideWithId = updateAiGuide.bind(null, id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Agente</h1>
                    <p className="text-muted-foreground mt-2">Configura la personalidad y el objetivo del agente de IA.</p>
                </div>
                <Link href="/admin/guides">
                    <Button variant="outline">Volver</Button>
                </Link>
            </div>

            <form action={updateGuideWithId} className="space-y-8 bg-card p-8 rounded-xl border border-border/50">
                <input type="hidden" name="slug" value={guide.slug} />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nombre del Agente</Label>
                        <Input id="title" name="title" defaultValue={guide.title} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" name="category" defaultValue={guide.category} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="objective">Objetivo / Descripción Corta</Label>
                    <Input id="objective" name="objective" defaultValue={guide.objective} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="system_prompt">System Prompt (El "Cerebro" de la IA)</Label>
                    <p className="text-xs text-muted-foreground mb-2">Aquí es donde defines cómo debe comportarse la IA, qué sabe y qué no sabe.</p>
                    <Textarea
                        id="system_prompt"
                        name="system_prompt"
                        defaultValue={guide.system_prompt}
                        className="min-h-[300px] font-mono whitespace-pre-wrap"
                        required
                    />
                </div>

                <div className="pt-4 border-t border-border/50 flex gap-4">
                    <Button type="submit">Guardar Cambios</Button>
                    <Link href="/admin/guides">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
