'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, User, Bot, Loader2, Scale, Search, ChefHat, Coins, Paperclip, ImageIcon, Smile, Mic } from 'lucide-react'
import { useRef, useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface Guide {
    id: string
    slug?: string
    title: string
    objective?: string
    category: string
}

interface AiChatInterfaceProps {
    guide: Guide
    allGuides: Guide[]
}

const CATEGORY_COLORS: Record<string, string> = {
    Verificación: 'text-cyan-400',
    Transparencia: 'text-amber-400',
    'Gobernanza Digital': 'text-primary',
    Democracia: 'text-emerald-400',
    'Participación Ciudadana': 'text-rose-400',
    Derecho: 'text-slate-400',
    Hogar: 'text-orange-400',
    'Análisis de gastos': 'text-green-400',
}

const getBotIcon = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('legal') || t.includes('derecho') || t.includes('asesor')) return Scale
    if (t.includes('noticias') || t.includes('fake') || t.includes('analista')) return Search
    if (t.includes('cocina') || t.includes('receta')) return ChefHat
    if (t.includes('bolsillo') || t.includes('gasto') || t.includes('finanza')) return Coins
    return Bot
}

export function AiChatInterface({ guide, allGuides }: AiChatInterfaceProps) {
    const [inputValue, setInputValue] = useState('')

    // Configurar el transporte para la API de chat
    const transport = useMemo(() => new DefaultChatTransport({
        api: '/api/chat',
        body: {
            guideId: guide.id,
        },
    }), [guide.id])

    const { messages, sendMessage, status, error } = useChat({
        id: `chat-${guide.id}`,
        transport,
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                parts: [
                    {
                        type: 'text',
                        text: `¡Hola! Soy tu ${guide.title}. Estoy listo para ayudarte con: *${guide.objective}*\n\n¿Cuál es tu primera consulta?`,
                    },
                ],
            } as UIMessage,
        ],
    })

    const isLoading = status === 'submitted' || status === 'streaming'
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const text = inputValue
        setInputValue('')

        try {
            await sendMessage({ text })
        } catch (err) {
            console.error('Error sending message:', err)
        }
    }

    const getMessageText = (m: UIMessage) => {
        return m.parts
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map(p => p.text)
            .join('')
    }

    return (
        <div className="flex w-full h-[calc(100vh-80px)] bg-[#020817] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-80 border-r border-[#1E293B] bg-[#02050E] p-4 flex flex-col gap-4 hidden md:flex">
                <h2 className="text-[11px] font-semibold text-slate-400 tracking-wider mb-2">TUS CHATBOTS CIUDADANOS ACTIVAS</h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {allGuides.map(g => {
                        const Icon = getBotIcon(g.title)
                        const isActive = g.id === guide.id
                        return (
                            <Link href={`/ai-guides/${g.slug}`} key={g.id}>
                                <div className={`px-2 py-3 rounded-xl flex items-start gap-4 cursor-pointer transition-all ${isActive ? 'bg-[#0f172a]/40 border-l-2 border-cyan-400' : 'border-l-2 border-transparent hover:bg-[#0f172a]/20'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${isActive ? 'border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-800 text-slate-500'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-sm truncate pr-2 text-slate-200">{g.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#0f172a] border border-[#1E293B] whitespace-nowrap ${CATEGORY_COLORS[g.category] || 'text-slate-400'}`}>
                                                {g.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-green-500 pointer-events-none'}`} />
                                            <span className={`text-xs ${isActive ? 'text-green-500' : 'text-green-500 pointer-events-none'}`}>{isActive ? 'En línea (Punto verde)' : 'Disponible'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#020817]">
                {/* Header */}
                <div className="h-20 border-b border-[#1E293B] px-6 lg:px-8 flex items-center gap-4 bg-[#02050E]/50">
                    <div className="w-14 h-14 rounded-full border-2 border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] shrink-0">
                        {(() => {
                            const HeaderIcon = getBotIcon(guide.title)
                            return <HeaderIcon className="w-7 h-7" />
                        })()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-bold text-lg lg:text-xl text-slate-100">{guide.title}</h1>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f172a] border border-[#1E293B] text-slate-400">gpt-4o / claude-3.5</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-green-500 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            En línea
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
                    <div className="max-w-4xl mx-auto space-y-6 w-full">
                        {messages.map((m: UIMessage) => {
                            const content = getMessageText(m)
                            if (!content && m.role === 'assistant' && !isLoading) return null

                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-12 h-12 shadow-[0_0_15px_rgba(34,211,238,0.15)] rounded-full border-2 border-cyan-400/40 bg-[#02050E] flex flex-shrink-0 items-center justify-center text-cyan-400">
                                            {(() => {
                                                const MsgIcon = getBotIcon(guide.title)
                                                return <MsgIcon className="w-6 h-6" />
                                            })()}
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-3xl ${m.role === 'assistant' ? 'rounded-tl-sm' : 'rounded-tr-sm'} px-6 py-4 text-[15px] prose prose-sm dark:prose-invert max-w-none shadow-sm ${m.role === 'user'
                                            ? 'bg-cyan-600/20 text-cyan-50 prose-a:text-cyan-200 border border-cyan-500/30'
                                            : 'bg-[#e2e8f0] text-slate-900 border border-[#CBD5E1]'
                                            }`}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {content}
                                        </ReactMarkdown>
                                    </div>

                                    {m.role === 'user' && (
                                        <div className="w-10 h-10 rounded-full bg-cyan-900 flex flex-shrink-0 items-center justify-center text-cyan-400 border border-cyan-800">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}

                        {isLoading && (
                            <div className="flex gap-4 justify-start">
                                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/40 bg-[#02050E] flex flex-shrink-0 items-center justify-center text-cyan-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="bg-[#e2e8f0] text-slate-900 border border-[#CBD5E1] rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                    <span className="text-[15px] font-medium text-slate-600">Escribiendo...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                                Hubo un error al enviar el mensaje. Por favor intenta de nuevo.
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input form */}
                <div className="p-4 lg:p-6 bg-[#02050E] border-t border-[#1E293B]">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative flex items-center rounded-2xl border border-[#1E293B] bg-[#0f172a] shadow-sm focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                            <button type="button" className="pl-4 pr-2 text-slate-400 hover:text-slate-200 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            
                            <input
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-transparent px-2 py-4 focus:outline-none font-medium text-slate-200 placeholder:text-slate-500"
                                disabled={isLoading}
                            />
                            
                            <div className="flex items-center pr-2 gap-1 text-slate-400">
                                <button type="button" className="p-2 hover:text-slate-200 transition-colors">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2 hover:text-slate-200 transition-colors hidden sm:block">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2 hover:text-slate-200 transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="p-2 ml-1 aspect-square rounded-full bg-slate-800 text-slate-300 flex flex-shrink-0 items-center justify-center hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
