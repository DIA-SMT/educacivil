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
                    <details key={guide.id} className="group p-6 rounded-xl border border-border/50 bg-card open:ring-1 open:ring-border">
                        <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {guide.title}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                                </h3>
                                <p className="text-sm text-primary mb-2">/{guide.slug}</p>
                                <p className="text-muted-foreground">{guide.objective}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                                {guide.category}
                            </span>
                        </summary>

                        <div className="mt-6 pt-4 border-t border-border/50">
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
                    </details>
                ))}
            </div>
        </div>
    )
}
