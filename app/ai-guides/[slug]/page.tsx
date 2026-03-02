import { notFound } from 'next/navigation'
import { aiGuides } from '@/data/courses'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AiGuideDocument } from '@/components/ai-guides/ai-guide-document'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return aiGuides.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const guide = aiGuides.find((g) => g.slug === slug)
  if (!guide) return {}
  return {
    title: `${guide.title} — Guías IA | CiviLearn`,
    description: guide.objective,
  }
}

export default async function AiGuideDetailPage({ params }: Props) {
  const { slug } = await params
  const guide = aiGuides.find((g) => g.slug === slug)
  if (!guide) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <AiGuideDocument guide={guide} />
      </main>
      <Footer />
    </div>
  )
}
