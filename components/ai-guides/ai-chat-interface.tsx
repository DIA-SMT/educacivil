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
        <div className="flex w-full h-[calc(100vh-80px)] bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-80 border-r border-border bg-card p-4 flex flex-col gap-4 hidden md:flex">
                <h2 className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-2">TUS CHATBOTS CIUDADANOS ACTIVAS</h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {allGuides.map(g => {
                        const Icon = getBotIcon(g.title)
                        const isActive = g.id === guide.id
                        return (
                            <Link href={`/ai-guides/${g.slug}`} key={g.id}>
                                <div className={`px-2 py-3 rounded-xl flex items-start gap-4 cursor-pointer transition-all ${isActive ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent hover:bg-muted/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${isActive ? 'border-primary text-primary shadow-[0_0_15px_rgba(0,102,255,0.3)]' : 'border-border text-muted-foreground'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-sm truncate pr-2 text-foreground">{g.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border whitespace-nowrap ${CATEGORY_COLORS[g.category] || 'text-muted-foreground'}`}>
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
            <div className="flex-1 flex flex-col bg-background">
                {/* Header */}
                <div className="h-20 border-b border-border px-6 lg:px-8 flex items-center gap-4 bg-card/50">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/60 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,102,255,0.25)] shrink-0">
                        {(() => {
                            const HeaderIcon = getBotIcon(guide.title)
                            return <HeaderIcon className="w-7 h-7" />
                        })()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-bold text-lg lg:text-xl text-foreground">{guide.title}</h1>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">gpt-4o / claude-3.5</span>
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
                                        <div className="w-12 h-12 shadow-[0_0_15px_rgba(0,102,255,0.15)] rounded-full border-2 border-primary/40 bg-card flex flex-shrink-0 items-center justify-center text-primary">
                                            {(() => {
                                                const MsgIcon = getBotIcon(guide.title)
                                                return <MsgIcon className="w-6 h-6" />
                                            })()}
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-3xl ${m.role === 'assistant' ? 'rounded-tl-sm' : 'rounded-tr-sm'} px-6 py-4 text-[15px] prose prose-sm dark:prose-invert max-w-none shadow-sm ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground prose-a:text-primary-foreground/80 border border-primary/30'
                                            : 'bg-muted text-foreground border border-border'
                                            }`}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {content}
                                        </ReactMarkdown>
                                    </div>

                                    {m.role === 'user' && (
                                        <div className="w-10 h-10 rounded-full bg-primary flex flex-shrink-0 items-center justify-center text-primary-foreground border border-primary/50">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}

                        {isLoading && (
                            <div className="flex gap-4 justify-start">
                                <div className="w-12 h-12 rounded-full border-2 border-primary/40 bg-card flex flex-shrink-0 items-center justify-center text-primary">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="bg-muted text-foreground border border-border rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    <span className="text-[15px] font-medium text-muted-foreground">Escribiendo...</span>
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
                <div className="p-4 lg:p-6 bg-card border-t border-border">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative flex items-center rounded-2xl border border-border bg-input/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                            <button type="button" className="pl-4 pr-2 text-muted-foreground hover:text-foreground transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            
                            <input
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-transparent px-2 py-4 focus:outline-none font-medium text-foreground placeholder:text-muted-foreground"
                                disabled={isLoading}
                            />
                            
                            <div className="flex items-center pr-2 gap-1 text-muted-foreground">
                                <button type="button" className="p-2 hover:text-foreground transition-colors">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2 hover:text-foreground transition-colors hidden sm:block">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2 hover:text-foreground transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="p-2 ml-1 aspect-square rounded-full bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
