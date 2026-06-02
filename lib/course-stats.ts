import { supabase } from '@/lib/supabase'

export type CourseStats = {
    rating: number
    students: number
    review_count: number
}

/**
 * Trae las estadísticas reales por curso desde la view `course_stats`:
 * - rating: promedio real de las reseñas del curso (course_feedback, lesson_id = '__course_review__')
 * - students: alumnos distintos con progreso (lesson_progress)
 * - review_count: cantidad de reseñas
 * Devuelve un mapa por `slug`. Si `slugs` se omite, trae todos.
 */
export async function getCourseStatsMap(slugs?: string[]): Promise<Record<string, CourseStats>> {
    let query = supabase.from('course_stats').select('course_slug, rating, students, review_count')
    if (slugs && slugs.length > 0) {
        query = query.in('course_slug', slugs)
    }
    const { data, error } = await query
    if (error) {
        console.error('Error fetching course_stats:', error)
        return {}
    }
    const map: Record<string, CourseStats> = {}
    for (const row of data ?? []) {
        map[(row as any).course_slug] = {
            rating: Number((row as any).rating) || 0,
            students: Number((row as any).students) || 0,
            review_count: Number((row as any).review_count) || 0,
        }
    }
    return map
}

/** Reemplaza rating/students de cada curso con los valores reales del mapa. */
export function mergeCourseStats<T extends { slug: string }>(
    courses: T[],
    statsMap: Record<string, CourseStats>
): (T & { rating: number; students: number })[] {
    return courses.map((c) => {
        const s = statsMap[c.slug]
        return { ...c, rating: s?.rating ?? 0, students: s?.students ?? 0 }
    })
}
