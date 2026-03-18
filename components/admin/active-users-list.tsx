'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, User, Mail, Zap } from "lucide-react"

interface ActiveUser {
  name: string
  email: string
  count: number
}

interface ActiveUsersListProps {
  users: ActiveUser[]
}

export function ActiveUsersList({ users }: ActiveUsersListProps) {
  return (
    <Card className="col-span-1 lg:col-span-3 bg-red-950/5 border-red-500/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Usuarios que usaron los asistentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user, idx) => (
            <div 
              key={user.email} 
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all duration-300 group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-600/20 transition-colors">
                <User className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">{user.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                    {user.count} {user.count === 1 ? 'Interacción' : 'Interacciones'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm italic">
              Todavía no hay usuarios con actividad registrada.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
