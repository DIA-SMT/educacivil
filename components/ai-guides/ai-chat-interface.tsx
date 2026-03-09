'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import { useRef, useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AiChatInterfaceProps {
    guide: {
        id: string
        title: string
        objective: string
    }
}

export function AiChatInterface({ guide }: AiChatInterfaceProps) {
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
                        text: `¡Hola! Soy tu asistente experto: **${guide.title}**.\n\nEstoy aquí para ayudarte con: *${guide.objective}*\n\n¿En qué te puedo ayudar hoy?`,
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">{guide.title}</h1>
                <p className="text-muted-foreground">{guide.objective}</p>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm space-y-6">
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
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary">
                                    <Bot className="w-5 h-5" />
                                </div>
                            )}

                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3 prose prose-sm dark:prose-invert max-w-none shadow-sm ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground prose-a:text-primary-foreground/80'
                                    : 'bg-card border border-border/50'
                                    }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>

                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-muted flex flex-shrink-0 items-center justify-center text-muted-foreground">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </motion.div>
                    )
                })}

                {isLoading && (
                    <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-card border border-border/50 rounded-2xl px-5 py-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Pensando...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                        Hubo un error al enviar el mensaje. Por favor intenta de nuevo.
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full rounded-full border border-border/50 bg-background px-6 py-4 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-5 h-5 ml-1" />
                </button>
            </form>
        </div>
    )
}
