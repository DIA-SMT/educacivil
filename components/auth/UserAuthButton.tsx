'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, LogOut, ChevronDown, Shield } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface CiditucUser {
  dni: string
  nombre: string | null
  apellido: string | null
  email: string | null
}

export function UserAuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; role: string | null } | null>(null)
  const [cidituc, setCidituc] = useState<CiditucUser | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
        setLoading(false)
      } else {
        // Sin sesión Supabase: chequear si hay sesión de CiDiTuc.
        fetch('/api/auth/cidituc/me')
          .then((res) => res.json())
          .then((data) => setCidituc(data.user ?? null))
          .catch(() => setCidituc(null))
          .finally(() => setLoading(false))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      } else {
        // Fetch profile if user session changed
        const supabase = createClient()
        supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    // Cerramos ambas sesiones: la de Supabase y la de CiDiTuc (cookie httpOnly).
    await Promise.all([
      supabase.auth.signOut(),
      fetch('/api/auth/cidituc/logout', { method: 'POST' }).catch(() => {}),
    ])
    window.location.href = '/'
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user && !cidituc) {
    return (
      <Link
        href="/signin"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
      >
        <User className="w-4 h-4" />
        Iniciar sesión
      </Link>
    )
  }

  const ciditucName = cidituc
    ? `${cidituc.nombre ?? ''} ${cidituc.apellido ?? ''}`.trim() || cidituc.dni
    : null
  const displayName =
    profile?.full_name ?? user?.email?.split('@')[0] ?? ciditucName ?? 'Usuario'
  const displayEmail = user?.email ?? cidituc?.email ?? cidituc?.dni ?? ''

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 transition-all duration-200"
        aria-label="Menú de usuario"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            displayName.charAt(0)
          )}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-border p-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
          {user && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors mb-1"
            >
              <User className="w-3.5 h-3.5" />
              Mi perfil
            </Link>
          )}
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium mb-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Panel de Administrador
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
