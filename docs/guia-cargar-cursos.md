# 📚 Guía para cargar cursos — EducaCivil

Esta guía explica, paso a paso, cómo crear y cargar un curso completo desde el panel
de administración. No necesitás saber de programación: es todo desde la web.

---

## 🧩 Cómo se organiza un curso

Antes de empezar, entendé la estructura. Un curso se arma como una "carpeta dentro
de otra", de lo más general a lo más chico:

```
CURSO
  └── MÓDULO         (un tema o sección grande. Ej: "Introducción")
        └── LECCIÓN   (cada clase. Ej: "¿Qué es la democracia?")
              ├── 🎥 Video        (subido o link de YouTube)
              ├── 📄 Recursos     (PDFs, plantillas, enlaces para descargar)
              └── ❓ Cuestionario  (preguntas para evaluar al alumno)
```

> **En criollo:** un curso tiene **módulos**, cada módulo tiene **lecciones**, y dentro
> de cada lección cargás el **video, los PDFs y el cuestionario**.

---

## ✅ Paso a paso

### Paso 1 — Entrar al panel de administración

1. Iniciá sesión con tu cuenta de administrador.
2. En el menú lateral, hacé clic en **Cursos**.
3. Vas a ver la lista de cursos existentes y un botón para crear uno nuevo.

---

### Paso 2 — Crear el curso

Hacé clic en **Crear Nuevo Curso** y completá los datos generales:

| Campo | Qué poner | ¿Obligatorio? |
|-------|-----------|----------------|
| **Título del Curso** | El nombre del curso. Ej: "Formación Ciudadana Básica" | Sí |
| **Categoría** | El área temática. Ej: "Democracia", "Derechos" | Sí |
| **Subtítulo** | Una frase corta que resume el curso | Sí |
| **Descripción Detallada** | Explicá de qué trata y qué va a aprender el alumno | Sí |
| **Video de presentación** | (Opcional) Link de YouTube de un video introductorio. **No es una clase**, es solo el video de portada | No |
| **Imagen de Portada** | (Opcional) Una imagen representativa del curso | No |

Hacé clic en **Crear Curso**.

> 💡 Al crear el curso, el sistema te lleva **directo al editor de contenido** y ya
> te deja creado un **"Módulo 1"** para que empieces a cargar lecciones enseguida.

---

### Paso 3 — Crear los módulos

Los módulos agrupan las lecciones por tema.

1. Ya tenés un **"Módulo 1"** creado. Si querés renombrarlo, pasá el mouse por encima
   y hacé clic en el ✏️ (lápiz).
2. Para agregar más módulos, hacé clic en **Agregar Módulo**, escribí el título y
   **Guardar**.

> Ejemplo de módulos: "Introducción", "Conceptos básicos", "Casos prácticos".

---

### Paso 4 — Crear las lecciones

Dentro de cada módulo:

1. Hacé clic en **Agregar Lección**.
2. Escribí el título de la lección (ej: "¿Qué es la división de poderes?").
3. Hacé clic en **Crear y editar**.

> 💡 Apenas la creás, **se abre el editor de la lección automáticamente** para que
> cargues el contenido. No tenés que guardar y volver a entrar.

---

### Paso 5 — Cargar el contenido de la lección

Una vez abierto el editor de la lección, podés cargar tres tipos de cosas:

#### 🎥 A) El Video

En el campo **"URL del Video o Subir Archivo"** tenés dos opciones:

- **Opción 1 — Pegar un link:** copiá y pegá el enlace de YouTube o Loom.
- **Opción 2 — Subir un archivo:** hacé clic en **Subir** y elegí un archivo de video
  (`.mp4`) desde tu computadora.

> 💡 Si subís un archivo, el sistema lo guarda solo y **calcula la duración
> automáticamente**. No tenés que escribir cuánto dura.

#### 📄 B) Los Recursos (PDFs, plantillas, enlaces)

En la sección **"Recursos Descargables (PDFs, Links)"**:

1. (Opcional) Escribí un **nombre** para el recurso (ej: "Guía de lectura").
2. Elegí el **tipo**:
   - **Archivo PDF** → para subir un documento desde tu computadora.
   - **Enlace Externo** → para un link a una página web.
3. Según el tipo:
   - Si es **PDF**: hacé clic en **Subir** y elegí el archivo. Se guarda solo.
   - Si es **Enlace**: pegá la URL y hacé clic en **Agregar**.

Podés agregar **varios recursos** a la misma lección. Para borrar uno, usá el 🗑️.

#### ❓ C) El Cuestionario (opcional)

Si querés evaluar al alumno en esa lección:

1. Hacé clic en **Crear Cuestionario**.
2. Para cada pregunta:
   - Escribí la **pregunta**.
   - Completá las **opciones de respuesta** (al menos 2).
   - Marcá la **respuesta correcta** con el círculo verde ✓.
   - (Opcional) Escribí una **explicación** de por qué esa es la correcta.
   - Hacé clic en **Agregar Pregunta**.
3. Repetí para todas las preguntas que quieras.

#### Guardar la lección

Cuando termines, hacé clic en **Guardar Cambios de Lección** y luego en
**Cerrar Editor**.

> ⚠️ El video y los recursos se guardan solos al subirlos, pero el **título y los
> textos** de la lección se guardan recién cuando apretás **Guardar Cambios de Lección**.

---

### Paso 6 — Completar los datos finales del curso

Cuando ya tengas **todos los módulos y lecciones cargados**, subí hasta la parte de
arriba de la pantalla (formulario **"Editar Curso"**) y completá:

| Campo | Qué poner |
|-------|-----------|
| **Nivel** | Principiante, Intermedio o Avanzado |
| **Instructor / Docente** | El nombre de quien dicta el curso |
| **Etiqueta destacada** | (Opcional) "Nuevo", "Popular" o "Destacado". Aparece como una insignia sobre la portada |
| **Duración total estimada** | Cuánto dura el curso en total. Ej: "3h 30min". **Cargala al final**, cuando ya sabés cuántas clases tiene |
| **Imagen de Portada** | Si no la cargaste al crear, subila ahora |

Hacé clic en **Guardar Cambios**.

---

## 📍 Resumen: ¿dónde va cada cosa?

| Contenido | Dónde se carga |
|-----------|----------------|
| 🎥 **Video de una clase** | Dentro de la **lección** → campo "URL del Video o Subir Archivo" |
| 📄 **PDF / plantilla** | Dentro de la **lección** → sección "Recursos Descargables" |
| 🔗 **Enlace externo** | Dentro de la **lección** → "Recursos", tipo "Enlace Externo" |
| ❓ **Preguntas de evaluación** | Dentro de la **lección** → sección "Cuestionario" |
| 🖼️ **Imagen de portada del curso** | En el formulario general del curso |
| 🎬 **Video de presentación (trailer)** | En el formulario general del curso (no es una clase) |
| ⏱️ **Duración total / Nivel / Instructor** | En el formulario general del curso, al final |

---

## 💡 Consejos y buenas prácticas

- **Orden:** los módulos y las lecciones aparecen en el **orden en que los creás**.
  Creálos en el orden en que querés que el alumno los vea.
- **Nombres claros:** poné títulos descriptivos en lecciones y recursos. El alumno
  los ve tal cual los escribís.
- **Videos:** si el video ya está en YouTube, es más rápido **pegar el link** que subir
  el archivo.
- **PDFs:** revisá que el archivo sea el correcto antes de subirlo; para reemplazarlo,
  borralo (🗑️) y subí el nuevo.
- **Cuestionarios:** siempre marcá la respuesta correcta antes de agregar la pregunta.
- **Duración:** cargala recién al final, así ponés un número real.

---

## ❓ Preguntas frecuentes

**¿Tengo que crear todo de una vez?**
No. Podés crear el curso, cargar algunas lecciones y volver más tarde para seguir.
Todo se guarda a medida que avanzás.

**¿Puedo tener una lección con solo un PDF y sin video?**
Sí. El video es opcional. Si la lección no tiene video, simplemente no se muestra
duración.

**¿Cuántos recursos puedo agregar por lección?**
Los que quieras (varios PDFs, varios links, etc.).

**¿El cuestionario es obligatorio?**
No. Solo crealo si querés evaluar esa lección.

**Subí un video pero no veo la duración.**
La duración se detecta sola al subir un **archivo**. Si pegaste un **link de YouTube**,
la duración no se calcula automáticamente (queda sin mostrarse).

**¿Cómo elimino un módulo, lección o recurso?**
Pasá el mouse por encima y hacé clic en el ícono de tacho 🗑️. Te va a pedir
confirmación antes de borrar.

**¿Por qué el curso dice "Sin reseñas aún"?**
Las estrellas (puntaje) aparecen recién cuando los alumnos terminan el curso y lo
califican. Es normal que un curso nuevo no tenga puntaje todavía.

---

## 📋 Checklist antes de dar por terminado un curso

- [ ] El curso tiene título, subtítulo y descripción.
- [ ] Tiene imagen de portada.
- [ ] Tiene al menos un módulo con sus lecciones.
- [ ] Cada lección tiene su video y/o sus recursos.
- [ ] Los cuestionarios (si los hay) tienen la respuesta correcta marcada.
- [ ] Cargaste Nivel, Instructor y Duración total.
- [ ] Le diste **Guardar Cambios** al final.
