import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteAiGuide } from '../actions'

export const revalidate = 0

export default async function AdminGuidesPage() {
    const { data: guides } = await supabase.from('ai_guides').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Agentes de IA</h1>
                    <p className="text-muted-foreground mt-2">Gestiona las personalidades y contextos ("system prompts") de los agentes.</p>
                </div>
                <Link
                    href="/admin/guides/new"
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                    Nuevo Agente
                </Link>
            </div>

            <div className="grid gap-6">
                {guides?.map((guide) => (
                    <div key={guide.id} className="p-6 rounded-xl border border-border/50 bg-card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{guide.title}</h3>
                                <p className="text-sm text-primary mb-2">/{guide.slug}</p>
                                <p className="text-muted-foreground">{guide.objective}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                                {guide.category}
                            </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <h4 className="text-sm font-medium mb-2">System Prompt (Personalidad de la IA):</h4>
                            <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm font-mono text-muted-foreground">
                                {guide.system_prompt}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <Link
                                href={`/admin/guides/${guide.id}`}
                                className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Editar Agente
                            </Link>

                            <DeleteButton
                                id={guide.id}
                                itemName={guide.title}
                                onDelete={deleteAiGuide}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
