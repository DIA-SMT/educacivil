'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/courses', label: 'Cursos' },
  { href: '/ai-guides', label: 'Guías IA' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-bold md:text-xl tracking-tight text-foreground transition-all duration-300 ml-1">
            Hub <span className="text-primary neon-text-cyan">IA</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA 
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/courses"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground glow-primary hover:opacity-90 transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            Explorar cursos
          </Link>
        </div> */}

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-border px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/courses"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
          >
            <BookOpen className="w-4 h-4" />
            Explorar cursos
          </Link>
        </div>
      )}
    </header>
  )
}
