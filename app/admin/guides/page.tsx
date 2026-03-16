import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteAiGuide } from '../actions'

export const revalidate = 0

export default async function AdminGuidesPage() {
    const { data: guides } = await supabase.from('ai_guides').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Agentes de <span className="text-red-600">IA</span></h1>
                    <p className="text-slate-500 mt-2 text-sm">Gestiona las personalidades y contextos ("system prompts") de los agentes ciudadanIA.</p>
                </div>
                <Link
                    href="/admin/guides/new"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 active:scale-[0.98]"
                >
                    + Nuevo Agente
                </Link>
            </div>

            <div className="grid gap-6">
                {guides?.map((guide) => (
                    <details key={guide.id} className="group p-8 rounded-[2rem] border border-red-500/10 bg-red-500/5 backdrop-blur-sm open:ring-1 open:ring-red-500/30 open:bg-red-500/10 transition-all duration-300">
                        <summary className="flex justify-between items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                                        {guide.title}
                                    </h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 transition-transform group-open:rotate-180 text-red-500"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                    <span className="text-red-600/70">/{guide.slug}</span>
                                    <span>•</span>
                                    <span>{guide.category}</span>
                                </div>
                                <p className="text-slate-400 mt-3 text-sm line-clamp-2 max-w-2xl">{guide.objective}</p>
                            </div>
                        </summary>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-4">System Prompt (Identidad de la IA):</h4>
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 whitespace-pre-wrap text-xs font-mono text-slate-400 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                                {guide.system_prompt}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <Link
                                href={`/admin/guides/${guide.id}`}
                                className="text-sm px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
                            >
                                Ajustar Personalidad
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
