# Cómo cargar los videos de los cursos

## ⚠️ Lo primero: NO uses videos "Privados" de YouTube

YouTube tiene tres visibilidades y sólo dos sirven acá:

| Visibilidad | Aparece en búsquedas / canal | ¿Se incrusta en el Hub? |
|---|---|---|
| **Público** | Sí | ✅ Sí |
| **Oculto** / **No listado** (*Unlisted*) 🔗 | No | ✅ Sí |
| **Privado** 🔒 | No | ❌ **No** |

> **Ojo con el idioma de YouTube Studio.** Si la cuenta está en *español (España)*
> la opción **no se llama "No listado" sino "Oculto"** — es la misma. Para
> distinguirla sin depender del texto, mirá el ícono: **cadena 🔗 = Oculto/No listado**
> (sirve), **candado 🔒 = Privado** (no sirve).

Un video **Privado** sólo lo pueden ver las cuentas de Google que invites una por
una, y **no se puede incrustar en ningún sitio externo**: en el aula sale el
cartel negro de "El propietario del video no permite reproducirlo aquí". No hay
forma de sortearlo desde el código — es una restricción del reproductor de YouTube.

**Lo que sí funciona: canal con los videos en "No listado".** El canal no muestra
nada, los videos no salen en el buscador de YouTube ni en "sugeridos", y sólo
llega quien tiene el link. Es exactamente el efecto que se busca con un "canal
privado", y sí se puede incrustar.

### Además, en YouTube Studio conviene

- **Permitir incorporación** — en español de España aparece como **"Inserción"**.
  Está en *Contenido → seleccionar el video → Más acciones → Inserción*, o dentro
  del video en *Detalles → Mostrar más → Inserción*. Tiene que quedar **activada**.
- **Visibilidad: Oculto** (= *No listado*). Ver la tabla de arriba.
- **No lo marques como "Hecho para niños"**: eso deshabilita varias funciones del
  reproductor, entre ellas parte de la API que usa el aula para medir el avance.

### Glosario España ↔ Latinoamérica

| YouTube Studio en *es-ES* | En *es-419* / lo que suele decir la documentación |
|---|---|
| Vídeos | Videos |
| **Oculto** | **No listado** (*Unlisted*) |
| **Inserción** | **Permitir incorporación** (*Allow embedding*) |
| Más acciones | Más opciones |

### Si hace falta que el video sea inaccesible fuera del Hub

"No listado" es *oscuro pero no secreto*: quien tenga el link lo ve. Si en algún
momento se necesita que el video sólo se pueda ver estando logueado en el Hub,
la salida es subir el `.mp4` directo (botón **Subir** del editor de lecciones,
va a Supabase Storage) en vez de usar YouTube.

---

## Cargar una lección

1. **Panel admin → Cursos → (curso) → Módulo → Agregar lección**.
2. Se abre el editor. En **URL del Video**, pegá el link de YouTube y
   **salí del campo** (o apretá Enter): se guarda solo y aparece la miniatura en verde.
3. Completá el **Resumen** (es lo que ve el vecino en la pestaña "Resumen") y,
   si querés, la **Duración**.
4. **Guardar Cambios de Lección**.

Si el editor muestra *"Tenés cambios sin guardar"* en ámbar, todavía falta apretar Guardar.

### Formatos de link aceptados

Todos estos funcionan; el sistema los normaliza solo:

```
https://www.youtube.com/watch?v=XXXXXXXXXXX
https://youtu.be/XXXXXXXXXXX
https://youtu.be/XXXXXXXXXXX?si=...
https://www.youtube.com/watch?v=XXXXXXXXXXX&t=90s
https://www.youtube.com/embed/XXXXXXXXXXX
https://www.youtube.com/live/XXXXXXXXXXX
https://youtube.com/shorts/XXXXXXXXXXX
```

Al copiar desde una playlist, YouTube pega un `&list=RD...` que hace arrancar
una lista de reproducción ajena. El panel lo saca automáticamente al guardar.

### Otros orígenes

- **Archivo .mp4**: botón **Subir**. Detecta la duración solo. Es la única opción
  que no depende de un tercero.
- **Vimeo, Loom, Google Drive**: andan, pero en Loom y Drive el Hub **no puede
  medir cuánto se vio**, así que la lección se puede marcar como completada sin
  haber visto el video. Para cursos con certificado, usá **YouTube o .mp4**.

---

## Por qué una lección no muestra el video

| Síntoma | Causa | Solución |
|---|---|---|
| Cartel "El propietario no permite reproducirlo" | Video **Privado** o con incorporación deshabilitada | Pasarlo a *No listado* y permitir incorporación |
| "Esta lección es de lectura..." | La lección quedó con el campo de video vacío | Editar la lección y pegar el link en **URL del Video** (no en Recursos) |
| "No pudimos reconocer el enlace" | El link no es de un proveedor soportado | Usar YouTube, Vimeo, Loom, Drive o subir el .mp4 |
| Se ve en el admin pero no en público | Caché de la página | Ya se corrige solo al guardar; si persiste, recargar con Ctrl+F5 |

> El link del video va en **URL del Video**, no en *Recursos Descargables*. Un
> video cargado como "recurso tipo link" no se reproduce en el aula.
