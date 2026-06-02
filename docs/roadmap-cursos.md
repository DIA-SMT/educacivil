# Roadmap — Creación y edición de cursos

> Documento de referencia del flujo de cursos en EducaCivil: cómo está modelado,
> el flujo actual paso a paso, qué está bien, qué se puede simplificar y el plan
> de mejoras por etapas.

---

## 1. Modelo de datos (jerarquía)

La estructura es la estándar de cualquier plataforma de cursos (Udemy / Coursera / Teachable).
Es **jerárquica** y va de lo general a lo particular:

```
Curso (courses)
  └── Módulo (modules)            ← agrupa lecciones por tema
        └── Lección (lessons)     ← la unidad que ve el alumno
              ├── Video           (video_url: archivo subido o link)
              ├── Recursos (resources)   ← PDFs, docs, links, plantillas
              └── Cuestionario (lesson_quizzes)
                    └── Preguntas (quiz_questions)
```

### Tablas y campos principales

| Tabla | Campos clave | Notas |
|-------|--------------|-------|
| `courses` | `title, slug, subtitle, description, category, thumbnail, video_url, level, duration, badge, instructor, rating, students, ai_guide_slug` | Metadatos del curso |
| `modules` | `course_id, title, position` | Agrupador. Ordena por `position` |
| `lessons` | `module_id, title, video_url, duration, description, position` | Unidad de contenido. `duration` se autodetecta del video |
| `resources` | `lesson_id, title, type, url` | `type`: `pdf` \| `doc` \| `link` \| `template` |
| `lesson_quizzes` | `lesson_id, title, description` | 1 cuestionario por lección (se usa el `[0]`) |
| `quiz_questions` | `quiz_id, question_text, options[], correct_option_index, explanation, position` | Preguntas de opción múltiple |

---

## 2. Flujo actual (paso a paso)

**El flujo que describís es correcto.** Así funciona hoy:

1. **Crear el curso** → `/admin/courses/new`
   Se cargan los datos generales: título, categoría, subtítulo, descripción,
   imagen de portada y (opcional) un video. Al guardar, se genera el `slug`
   automáticamente y se crea el curso.

2. **Editar contenido** → `/admin/courses/[id]`
   En la misma pantalla del curso aparece el gestor de contenido
   (`CourseContentManager`):
   - **Agregar Módulo** → se crea al instante.
   - **Agregar Lección** (dentro del módulo) → se crea **y abre el editor al toque**.
   - Dentro del editor de la lección:
     - Subir **video** (archivo o link) → se guarda solo y **detecta la duración**.
     - Agregar **recursos** (PDFs/links) → se suben y guardan solos.
     - Crear **cuestionario** y agregar **preguntas**.

3. El alumno lo consume en `/courses/[slug]` (detalle) y `/learn/[slug]` (aula).

---

## 3. ¿Está bien hecho lógicamente?

**Sí.** La jerarquía `Curso → Módulo → Lección → Archivos` es la correcta y la
estándar de la industria. No conviene aplanarla: los módulos dan estructura y
permiten cursos largos bien organizados. Lo que sigue son **oportunidades de
simplificación**, no errores.

### ✅ Lo que está bien
- Jerarquía clara y estándar.
- Una sola pantalla para editar todo el contenido (no hay que navegar entre páginas).
- Acciones instantáneas (sin recargar) y autoguardado de video/recursos.
- La duración se calcula sola del video subido.

### ⚠️ Fricciones / mejoras posibles

1. **Después de crear el curso te manda a la lista, no al editor de contenido.**
   Lo natural sería: creo el curso → entro directo a cargar módulos y lecciones.
   *Fix simple:* en `createCourse`, redirigir a `/admin/courses/[id]` en vez de
   `/admin/courses`.

2. **`courses.video_url` vs `lessons.video_url` es confuso.**
   Hay un video a nivel curso Y a nivel lección. El alumno realmente consume los
   videos de las **lecciones**; el del curso funciona como *trailer/preview*.
   *Recomendación:* renombrar/etiquetar el del curso como "Video de presentación"
   o eliminarlo si no se usa, para que no se confunda con el contenido real.

3. **Campos del curso que no se pueden editar.**
   `level`, `duration`, `badge`, `instructor`, `rating`, `students` se setean con
   valores por defecto al crear (`level: 'Principiante'`, `duration: '1h 0m'`,
   `instructor: 'EducaCivil'`) y **nunca** se editan desde la UI.
   - `duration` del curso queda fijo en "1h 0m" aunque cargues 10 lecciones.
     *Mejora:* calcularlo automáticamente sumando la duración de las lecciones
     (ahora que la detectamos).
   - El resto: o se agregan al formulario de edición, o se quitan si no aportan.

4. **Obliga a pensar en "módulos" incluso para un curso simple.**
   Para un curso de 3 videos sueltos, crear un módulo es un paso extra.
   *Mejora opcional:* al crear el curso, generar un "Módulo 1" por defecto para
   que se pueda empezar a cargar lecciones de una.

5. **No se puede reordenar arrastrando.**
   El ícono de "agarrar" (`GripVertical`) es decorativo. Hoy el orden depende del
   `position` y se asigna por orden de creación.

---

## 4. Roadmap de mejoras (por etapas)

### ✅ Fase 0 — Ya hecho
- [x] Quitar las recargas de página: todo se actualiza al instante (`router.refresh`).
- [x] Al crear una lección se abre el editor automáticamente (no más "guardar y volver a entrar").
- [x] El video y los recursos se **guardan solos** al subirse.
- [x] La **duración** se autodetecta del video; no se muestra en lecciones sin video (ej: solo PDF).
- [x] Reemplazar `prompt`/`confirm`/`alert` nativos por toasts y diálogos.

### ✅ Fase 1 — Flujo de creación más directo (hecho)
- [x] Al crear el curso, redirigir directo al editor de contenido (`/admin/courses/[id]`).
- [x] Crear un "Módulo 1" por defecto al crear el curso.
- [x] Estado vacío guía: tarjeta "Crear primer módulo" + aviso en módulos sin lecciones.

### ✅ Fase 2 — Metadatos coherentes (hecho)
- [x] **Duración total estimada** editable a mano en el form de edición (se carga al final).
      Las lecciones sin duración y los cursos sin duración ya no muestran chip vacío.
- [x] Video del curso renombrado a **"Video de presentación"** en crear y editar.
- [x] **Nivel**, **Instructor/Docente** y **Etiqueta destacada** (badge) editables en el form.

### ✅ Fase 2.1 — Rating y alumnos reales (hecho en código, requiere correr 1 script)
- [x] `rating` mostrado = **promedio real** de `course_feedback` (reseñas de curso).
- [x] `students` mostrado = **alumnos distintos** con progreso (`lesson_progress`).
- [x] El catálogo y destacados ordenan por alumnos reales.
- [x] Cursos sin reseñas muestran "Sin reseñas aún" en vez de estrellas inventadas.
- [ ] **Pendiente:** correr `supabase/course_stats.sql` en Supabase (crea la view de stats).

> Implementación: una view `course_stats` (solo lectura, agregada) calcula el rating
> promedio y los alumnos por `course_slug`. El front la consume vía
> `lib/course-stats.ts` y reemplaza los valores estáticos. Hasta correr el script,
> los cursos van a mostrar "Sin reseñas aún" / 0 alumnos.

### 🔜 Fase 3 — Organización avanzada
- [ ] Reordenar módulos y lecciones **arrastrando** (drag & drop).
- [ ] Duplicar lección / módulo.
- [ ] Vista previa rápida de la lección como la ve el alumno.

### 🔮 Fase 4 — Ideas a futuro
- [ ] Estado borrador/publicado por curso (no mostrar cursos a medio cargar).
- [ ] Detección de duración para links de YouTube/Loom (vía API).
- [ ] Reutilizar recursos entre lecciones.

---

## 5. Archivos relevantes

| Qué | Dónde |
|-----|-------|
| Crear curso (form) | `app/admin/courses/new/page.tsx` |
| Editar curso + contenido | `app/admin/courses/[id]/page.tsx` |
| Gestor de módulos/lecciones | `components/admin/course-content-manager.tsx` |
| Server actions (CRUD) | `app/admin/actions.ts` |
| Vista alumno (detalle) | `components/courses/course-detail-view.tsx` |
| Vista alumno (aula) | `components/learn/classroom-view.tsx` |
