import Link from 'next/link'
import { GraduationCap, Github, Twitter, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Civi<span className="text-primary">Learn</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma de formación ciudadana digital. Aprende, participa y transforma tu comunidad.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Plataforma</h3>
            <ul className="space-y-2">
              {[
                { href: '/courses', label: 'Catálogo de cursos' },
                { href: '/ai-guides', label: 'Guías de IA' },
                { href: '/#como-funciona', label: 'Cómo funciona' },
                { href: '/#metodologia', label: 'Metodología' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Categorías</h3>
            <ul className="space-y-2">
              {[
                'Democracia',
                'Derechos Humanos',
                'Transparencia',
                'Gobernanza Digital',
                'Ética Pública',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/courses?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Legal & Info</h3>
            <ul className="space-y-2">
              {[
                { href: '#terminos', label: 'Términos de uso' },
                { href: '#privacidad', label: 'Privacidad' },
                { href: '#accesibilidad', label: 'Accesibilidad' },
                { href: '#contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CiviLearn. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            {/* TODO: Add certification badge when backend is ready */}
            Plataforma educativa de código abierto
          </p>
        </div>
      </div>
    </footer>
  )
}
