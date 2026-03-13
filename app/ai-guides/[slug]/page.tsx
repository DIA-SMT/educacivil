import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AiChatInterface } from '@/components/ai-guides/ai-chat-interface'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

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
    title: `${guide.title} — Asistente IA | Hub IA`,
    description: guide.objective,
  }
}

export default async function AiGuideDetailPage({ params }: Props) {
  const { slug } = await params

  const [{ data: guide }, { data: allGuides }] = await Promise.all([
    supabase
      .from('ai_guides')
      .select('id, title, objective, category')
      .eq('slug', slug)
      .single(),
    supabase
      .from('ai_guides')
      .select('id, slug, title, category')
      .order('created_at', { ascending: true }),
  ])

  if (!guide) notFound()

  // Track usage for logged-in users (fire-and-forget, don't block render)
  try {
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (user) {
      await serverSupabase.from('assistant_usage').insert({
        user_id: user.id,
        assistant_slug: slug,
        assistant_title: guide.title,
      })
    }
  } catch {
    // Non-critical, don't crash the page
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020817]">
      <Navbar />
      <main className="flex-1 pt-20">
        <AiChatInterface guide={guide} allGuides={allGuides || []} />
      </main>
    </div>
  )
}
