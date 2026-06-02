-- =============================================================
-- course_stats: estadísticas REALES por curso
--   * rating       -> promedio real de las reseñas del curso
--                     (course_feedback con lesson_id = '__course_review__')
--   * review_count -> cantidad de reseñas
--   * students     -> alumnos distintos con progreso (lesson_progress)
--
-- Es una VIEW de solo lectura. Corre con permisos del owner (postgres),
-- así que agrega sobre TODAS las filas (no la limita el RLS de cada usuario).
-- Solo expone números agregados, no datos personales.
-- =============================================================

create or replace view public.course_stats as
select
    c.slug                       as course_slug,
    coalesce(r.rating, 0)        as rating,
    coalesce(r.review_count, 0)  as review_count,
    coalesce(s.students, 0)      as students
from public.courses c
left join (
    select
        course_slug,
        round(avg(rating)::numeric, 1) as rating,
        count(*)                       as review_count
    from public.course_feedback
    where lesson_id = '__course_review__'
    group by course_slug
) r on r.course_slug = c.slug
left join (
    select
        course_slug,
        count(distinct user_id) as students
    from public.lesson_progress
    group by course_slug
) s on s.course_slug = c.slug;

-- Permitir que el front (clave anon) y los usuarios logueados puedan leerla.
grant select on public.course_stats to anon, authenticated;
