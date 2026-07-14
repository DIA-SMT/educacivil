import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { CIDITUC_SESSION_COOKIE, verifySession } from '@/lib/cidituc'

// Si Supabase no responde (proyecto pausado, caído o inaccesible), la librería
// de auth reintenta con backoff y puede colgar el middleware hasta superar el
// límite de Vercel (504 MIDDLEWARE_INVOCATION_TIMEOUT en TODO el sitio). Con
// este tope, ante una caída seguimos sin usuario: las rutas públicas cargan
// igual y las protegidas fallan cerradas (redirigen al login).
const SUPABASE_TIMEOUT_MS = 3000

function withTimeout<T>(promise: PromiseLike<T>, fallback: T): Promise<T> {
    return Promise.race([
        Promise.resolve(promise).catch(() => fallback),
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), SUPABASE_TIMEOUT_MS)),
    ])
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await withTimeout<{ data: { user: User | null } }>(supabase.auth.getUser(), {
        data: { user: null },
    })

    const pathname = request.nextUrl.pathname

    // Sesión paralela de CiDiTuc (cookie propia, independiente de Supabase).
    const ciditucSession = await verifySession(
        request.cookies.get(CIDITUC_SESSION_COOKIE)?.value
    )
    const isAuthenticated = Boolean(user) || Boolean(ciditucSession)

    // Protect admin → redirect to login if not authenticated, or to home if not admin
    if (pathname.startsWith('/admin')) {
        if (!user) {
            // El panel admin es exclusivo de cuentas Supabase con rol admin.
            // Un usuario logueado con CiDiTuc va al home; uno sin sesión, al login.
            const url = request.nextUrl.clone()
            url.pathname = ciditucSession ? '/' : '/login'
            return NextResponse.redirect(url)
        }

        // If authenticated, check role (con timeout: si Supabase no responde,
        // profile queda null y se falla cerrado redirigiendo al home)
        const { data: profile } = await withTimeout<{ data: { role: string } | null }>(
            supabase.from('profiles').select('role').eq('id', user.id).single(),
            { data: null }
        )

        if (profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Protect courses and ai-guides → redirect to user signin
    const protectedRoutes = ['/courses', '/ai-guides', '/learn']
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
    if (!isAuthenticated && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/signin'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
