import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CIDITUC_SESSION_COOKIE, verifySession } from '@/lib/cidituc'

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
    } = await supabase.auth.getUser()

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

        // If authenticated, check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

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
