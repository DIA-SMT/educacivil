import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Hub IA',
  description:
    'Formación ciudadana moderna con cursos, Asistentes ciudadanIA y herramientas interactivas para aprender y crecer.',
  generator: 'v0.app',
  icons: {
    icon: '/logoMuni-sm.png',
  },
}

export const viewport = {
  themeColor: '#0a0f1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var hash = window.location.hash;
                var path = window.location.pathname;
                if (hash && (hash.includes('type=recovery') || hash.includes('access_token=')) && path !== '/auth/reset-password') {
                  // Prevenir parpadeo de la página principal redirigiendo inmediatamente
                  window.location.replace('/auth/reset-password' + hash);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthRedirectHandler />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
