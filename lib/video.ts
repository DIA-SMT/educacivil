// =============================================================================
// Normalización y clasificación de URLs de video.
//
// El aula usa react-player v3, que reconoce YouTube/Vimeo por regex sobre la
// URL. Si la URL no matchea ningún player conocido cae al player "html", que
// renderiza un <video src="..."> pelado: con un link de página web (Loom, Drive)
// eso queda en un recuadro negro sin error visible. Por eso normalizamos y
// clasificamos acá, una sola vez, y el aula decide qué renderizar.
// =============================================================================

export type VideoKind = 'youtube' | 'vimeo' | 'loom' | 'drive' | 'file' | 'unknown'

/** Extensiones que el <video> nativo del browser puede reproducir directo. */
const FILE_EXTENSIONS = /\.(mp4|webm|ogv|ogg|mov|m4v|m3u8)(\?|#|$)/i

/**
 * Saca el ID de 11 caracteres de cualquier formato de link de YouTube:
 * watch?v=, youtu.be/, /embed/, /shorts/, /live/, /v/, m.youtube.com,
 * youtube-nocookie.com, y con parámetros extra (&t=, &list=, ?si=).
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const clean = url.trim()

  const patterns = [
    /(?:youtube(?:-nocookie|education)?\.com\/(?:embed|v|shorts|live)\/)([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
    /[?&]v=([\w-]{11})/i,
  ]

  for (const re of patterns) {
    const m = clean.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

/** Segundos de arranque si el link trae ?t=90 / &t=1m30s / &start=90. */
export function getYouTubeStart(url: string): number | null {
  const m = url.match(/[?&](?:t|start)=([^&#]+)/i)
  if (!m) return null
  const raw = m[1]
  if (/^\d+$/.test(raw)) return Number(raw)
  const hms = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i)
  if (!hms) return null
  const [, h, mn, s] = hms
  const total = Number(h || 0) * 3600 + Number(mn || 0) * 60 + Number(s || 0)
  return total > 0 ? total : null
}

export function getLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{20,})/i)
  return m?.[1] ?? null
}

export function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  return m?.[1] ?? null
}

export function getDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/i)
  return m?.[1] ?? m?.[2] ?? null
}

/** Qué tipo de video es, para decidir cómo se renderiza. */
export function getVideoKind(url: string | null | undefined): VideoKind {
  if (!url || !url.trim()) return 'unknown'
  const u = url.trim()
  if (getYouTubeId(u)) return 'youtube'
  if (getVimeoId(u)) return 'vimeo'
  if (getLoomId(u)) return 'loom'
  if (getDriveId(u)) return 'drive'
  if (FILE_EXTENSIONS.test(u) || /supabase\.co\/storage\//i.test(u)) return 'file'
  return 'unknown'
}

/**
 * URL canónica para pasarle al reproductor.
 *
 * En YouTube devolvemos siempre `watch?v=ID` (+ &t= si venía), tirando
 * `&list=RD...` y `&index=`: esas listas "mix" que YouTube pega sola al copiar
 * el link hacen que el iframe arranque una playlist en vez de la clase.
 */
export function normalizeVideoUrl(url: string | null | undefined): string {
  if (!url) return ''
  const u = url.trim()
  if (!u) return ''

  const ytId = getYouTubeId(u)
  if (ytId) {
    const start = getYouTubeStart(u)
    return `https://www.youtube.com/watch?v=${ytId}${start ? `&t=${start}` : ''}`
  }

  const vimeoId = getVimeoId(u)
  if (vimeoId) return `https://vimeo.com/${vimeoId}`

  const loomId = getLoomId(u)
  if (loomId) return `https://www.loom.com/embed/${loomId}`

  const driveId = getDriveId(u)
  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`

  return u
}

/**
 * URL de <iframe> para los proveedores que react-player v3 ya no soporta
 * (Loom y Drive). Devuelve null si el tipo se reproduce por otra vía.
 */
export function getIframeEmbedUrl(url: string): string | null {
  const kind = getVideoKind(url)
  if (kind === 'loom') {
    const id = getLoomId(url)
    return id ? `https://www.loom.com/embed/${id}?hide_share=true&hideEmbedTopBar=true` : null
  }
  if (kind === 'drive') {
    const id = getDriveId(url)
    return id ? `https://drive.google.com/file/d/${id}/preview` : null
  }
  return null
}

/** Miniatura para previsualizar en el panel admin. */
export function getVideoThumbnail(url: string): string | null {
  const ytId = getYouTubeId(url)
  return ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null
}

/** Etiqueta legible del proveedor, para mensajes al administrador. */
export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  loom: 'Loom',
  drive: 'Google Drive',
  file: 'Archivo de video',
  unknown: 'No reconocido',
}
