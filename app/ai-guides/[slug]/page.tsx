import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AiChatInterface } from '@/components/ai-guides/ai-chat-interface'
import { supabase } from '@/lib/supabase'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate static params if preferred, otherwise we rely on ISR/SSR
export async function generateStaticParams() {
  const { data: guides } = await supabase.from('ai_guides').select('slug')
  return (guides || []).map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { data: guide } = await supabase
    .from('ai_guides')
    .select('title, objective')
    .eq('slug', slug)
    .single()

  if (!guide) return {}
  return {
    title: `${guide.title} — Asistente IA | EducaCivil`,
    description: guide.objective,
  }
}

export default async function AiGuideDetailPage({ params }: Props) {
  const { slug } = await params

  const { data: guide } = await supabase
    .from('ai_guides')
    .select('id, title, objective, category')
    .eq('slug', slug)
    .single()

  const { data: allGuides } = await supabase
    .from('ai_guides')
    .select('id, slug, title, category')
    .order('created_at', { ascending: true })

  if (!guide) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-[#020817]">
      <Navbar />
      <main className="flex-1 pt-20">
        <AiChatInterface guide={guide} allGuides={allGuides || []} />
      </main>
    </div>
  )
}
