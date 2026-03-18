'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, User, Calendar, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"

interface UsageLog {
  id: string
  assistant_slug: string
  assistant_title: string
  used_at: string
  user_id: string
  profiles: {
    full_name: string
    email: string
  }
}

interface RecentUsageTableProps {
  logs: UsageLog[]
}

export function RecentUsageTable({ logs }: RecentUsageTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMore = logs.length > 5
  const displayedLogs = isExpanded ? logs : logs.slice(0, 5)

  return (
    <Card className="col-span-1 lg:col-span-3 bg-red-950/5 border-red-500/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Registros Recientes de Uso</CardTitle>
        {hasMore && (
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-red-600/10 hover:text-red-500 rounded-xl"
           >
             {isExpanded ? (
               <><ChevronUp className="w-4 h-4 mr-2" /> Minimizar</>
             ) : (
               <><ChevronDown className="w-4 h-4 mr-2" /> Ver Todo</>
             )}
           </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-600/20 transition-colors">
                  <Bot className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{log.assistant_title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">{log.profiles?.full_name || 'Usuario desconocido'}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">{log.profiles?.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(log.used_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <Link 
                  href={`/ai-guides/${log.assistant_slug}`}
                  target="_blank"
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm italic">
              No se han encontrado registros de uso recientes.
            </div>
          )}

          {hasMore && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-full py-4 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors bg-gradient-to-t from-red-600/5 to-transparent rounded-b-2xl"
            >
              Cargar {logs.length - 5} registros más...
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
