import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'

// =============================================================================
// Métricas del panel administrador: diplomas emitidos y avance por curso.
//
// La tabla `certificates` tiene RLS "cada uno ve lo suyo" (supabase/certificates.sql),
// así que con el cliente de sesión un admin ve CERO filas. Todo lo agregado va
// por el cliente service-role, siempre detrás de assertAdmin().
// =============================================================================

export type DiplomaRow = {
    id: string
    certificateCode: string
    issuedAt: string
    studentName: string
    courseTitle: string
    courseSlug: string
    dni: string | null
    email: string | null
}

export type CourseMetric = {
    slug: string
    title: string
    lessons: number
    /** Personas con al menos una lección completada. */
    started: number
    /** Personas que completaron TODAS las lecciones del curso. */
    finished: number
    diplomas: number
    /** Promedio de lecciones completadas sobre el total, en %. */
    avgProgress: number
}

export type DiplomaStats = {
    totalDiplomas: number
    diplomasLast30Days: number
    totalStudents: number
    coursesWithDiplomas: number
    byMonth: { month: string; count: number }[]
    courses: CourseMetric[]
    diplomas: DiplomaRow[]
}

/** Corta la ejecución si quien llama no es admin. Obligatorio antes del service client. */
async function assertAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('No autorizado')
}

const MONTH_LABELS = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

export async function getDiplomaStats(): Promise<DiplomaStats> {
    await assertAdmin()
    const db = createServiceClient()

    const [certsRes, coursesRes, progressRes, profilesRes] = await Promise.all([
        db.from('certificates')
            .select('id, user_id, course_slug, certificate_code, issued_at, student_name_snapshot, course_title_snapshot')
            .order('issued_at', { ascending: false }),
        db.from('courses').select('slug, title, modules(id, lessons(id))'),
        db.from('lesson_progress').select('user_id, course_slug, lesson_id, completed'),
        db.from('profiles').select('id, dni, email, full_name'),
    ])

    const certs = certsRes.data ?? []
    const courses = coursesRes.data ?? []
    const progress = (progressRes.data ?? []).filter((r: any) => r.completed)
    const profiles = profilesRes.data ?? []

    const profileById = new Map(profiles.map((p: any) => [p.id, p]))

    // ---------------------------------------------------------------- diplomas
    const diplomas: DiplomaRow[] = certs.map((c: any) => {
        const p = profileById.get(c.user_id)
        return {
            id: c.id,
            certificateCode: c.certificate_code,
            issuedAt: c.issued_at,
            // El snapshot es el nombre con el que se emitió el diploma: es el
            // dato legal. El perfil sólo se usa de respaldo.
            studentName: c.student_name_snapshot || p?.full_name || 'Sin nombre',
            courseTitle: c.course_title_snapshot,
            courseSlug: c.course_slug,
            dni: p?.dni ?? null,
            email: p?.email ?? null,
        }
    })

    // ------------------------------------------------------------ por curso
    const diplomasBySlug = new Map<string, number>()
    for (const c of certs) {
        diplomasBySlug.set(c.course_slug, (diplomasBySlug.get(c.course_slug) ?? 0) + 1)
    }

    // user_id -> set de lecciones completadas, por curso
    const completedByCourse = new Map<string, Map<string, Set<string>>>()
    for (const row of progress as any[]) {
        if (!completedByCourse.has(row.course_slug)) completedByCourse.set(row.course_slug, new Map())
        const byUser = completedByCourse.get(row.course_slug)!
        if (!byUser.has(row.user_id)) byUser.set(row.user_id, new Set())
        byUser.get(row.user_id)!.add(row.lesson_id)
    }

    const courseMetrics: CourseMetric[] = courses.map((course: any) => {
        const lessonIds = new Set<string>(
            (course.modules ?? []).flatMap((m: any) => (m.lessons ?? []).map((l: any) => l.id))
        )
        const total = lessonIds.size
        const byUser = completedByCourse.get(course.slug) ?? new Map<string, Set<string>>()

        let finished = 0
        let progressSum = 0
        for (const done of byUser.values()) {
            // Contamos sólo lecciones que siguen existiendo: si se borró una
            // lección, el progreso viejo no debe inflar el porcentaje.
            const valid = [...done].filter((id) => lessonIds.has(id)).length
            if (total > 0 && valid >= total) finished++
            if (total > 0) progressSum += valid / total
        }

        const started = byUser.size
        return {
            slug: course.slug,
            title: course.title,
            lessons: total,
            started,
            finished,
            diplomas: diplomasBySlug.get(course.slug) ?? 0,
            avgProgress: started > 0 ? Math.round((progressSum / started) * 100) : 0,
        }
    })
    courseMetrics.sort((a, b) => b.started - a.started || b.diplomas - a.diplomas)

    // ------------------------------------------------------- serie por mes
    const byMonthMap = new Map<string, number>()
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        byMonthMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0)
    }
    for (const c of certs) {
        const d = new Date(c.issued_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (byMonthMap.has(key)) byMonthMap.set(key, byMonthMap.get(key)! + 1)
    }
    const byMonth = [...byMonthMap.entries()].map(([key, count]) => {
        const [y, m] = key.split('-')
        return { month: `${MONTH_LABELS[Number(m) - 1]} ${y.slice(2)}`, count }
    })

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
        totalDiplomas: certs.length,
        diplomasLast30Days: certs.filter((c: any) => new Date(c.issued_at) >= thirtyDaysAgo).length,
        totalStudents: new Set(progress.map((r: any) => r.user_id)).size,
        coursesWithDiplomas: diplomasBySlug.size,
        byMonth,
        courses: courseMetrics,
        diplomas,
    }
}
