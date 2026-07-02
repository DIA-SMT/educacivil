// Puente entre la identidad de CiDiTuc y Supabase Auth.
//
// El vecino entra SIEMPRE por CiDiTuc, pero todo el data layer (progreso,
// certificados, perfil) está keyeado por auth.users y protegido por RLS
// (auth.uid() = user_id). En vez de reescribir todo eso, le damos a cada
// identidad de CiDiTuc un "usuario-sombra" de Supabase, manejado por detrás:
//   - se crea/recupera con la service role key (admin API),
//   - su email/contraseña son sintéticos y determinísticos (nunca los usa una
//     persona), derivados del id_persona,
//   - el callback abre la sesión real de Supabase con esas credenciales.
//
// Así el resto de la app sigue funcionando sin tocarse.

import { createServiceClient } from '@/utils/supabase/service'

// Dominio de los emails sintéticos del usuario-sombra. No se manda mail a estas
// direcciones (se crean con email_confirm: true); solo tienen que ser únicas y
// con formato válido. Configurable por si se quiere usar un dominio propio.
const SHADOW_EMAIL_DOMAIN = process.env.CIDITUC_SHADOW_EMAIL_DOMAIN || 'cidituc.local'

// Email sintético estable para una identidad de CiDiTuc.
export function shadowEmail(idPersona: number): string {
  return `cidituc-${idPersona}@${SHADOW_EMAIL_DOMAIN}`
}

// Contraseña determinística del usuario-sombra: HMAC-SHA256(secreto, id_persona).
// Es estable (nos deja re-loguear en cada visita sin guardarla) y tan fuerte como
// HUBIA_SESSION_SECRET. Ninguna persona la ve ni la tipea.
async function shadowPassword(idPersona: number): Promise<string> {
  const secret = process.env.HUBIA_SESSION_SECRET
  if (!secret) {
    throw new Error('Falta HUBIA_SESSION_SECRET en el entorno (necesaria para el usuario-sombra de CiDiTuc)')
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`cidituc-shadow:${idPersona}`))
  const bytes = new Uint8Array(sig)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  // base64url + un sufijo que garantiza mayúscula/minúscula/dígito/símbolo por si
  // el proyecto tiene reglas de complejidad de contraseña activadas.
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `Ct1_${b64}`
}

// El backend de CiDiTuc devuelve `documento_persona` como CUIL de 11 dígitos
// (p.ej. 20420756764). El DNI son los 8 del medio, sin ceros a la izquierda
// (20-42075676-4 → 42075676). Si ya viniera como DNI (7-8 dígitos) lo dejamos.
export function dniFromDocumento(documento: string): string {
  const d = (documento || '').replace(/\D/g, '')
  if (d.length === 11) return String(parseInt(d.slice(2, 10), 10))
  return d
}

function isAlreadyRegistered(error: { message?: string; code?: string }): boolean {
  const msg = (error.message || '').toLowerCase()
  return (
    error.code === 'email_exists' ||
    msg.includes('already been registered') ||
    msg.includes('already registered') ||
    msg.includes('already exists')
  )
}

// Asegura que exista el usuario-sombra de Supabase para esta identidad de CiDiTuc
// y devuelve sus credenciales sintéticas para que el callback abra la sesión.
// Idempotente: si ya existe, no es un error (la contraseña determinística es la
// misma, así que el login posterior igual funciona).
export async function ensureShadowUser(idPersona: number): Promise<{ email: string; password: string }> {
  const svc = createServiceClient()
  const email = shadowEmail(idPersona)
  const password = await shadowPassword(idPersona)

  const { error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { cidituc_id: idPersona },
  })

  if (error && !isAlreadyRegistered(error)) {
    throw new Error(`No se pudo crear el usuario-sombra de CiDiTuc: ${error.message}`)
  }

  return { email, password }
}

// Repara la contraseña del usuario-sombra. Si fue creado con otro
// HUBIA_SESSION_SECRET (otro entorno, o una rotación del secreto), su contraseña
// determinística dejó de coincidir con la de ESTE entorno y el login falla con
// "Invalid login credentials". La reseteamos al valor actual. generateLink se usa
// solo para obtener el id del usuario existente; NO envía ningún mail.
export async function repairShadowPassword(email: string, password: string): Promise<void> {
  const svc = createServiceClient()
  const { data, error } = await svc.auth.admin.generateLink({ type: 'magiclink', email })
  const userId = data?.user?.id
  if (error || !userId) {
    throw new Error(
      `No se pudo ubicar el usuario-sombra para reparar su contraseña: ${error?.message ?? 'sin id'}`
    )
  }
  const { error: updateError } = await svc.auth.admin.updateUserById(userId, { password })
  if (updateError) {
    throw new Error(`No se pudo resetear la contraseña del usuario-sombra: ${updateError.message}`)
  }
}

// Prellena y bloquea el perfil legal con los datos oficiales de CiDiTuc. Usa la
// service role key (bypassa RLS). No hay trigger que cree la fila de `profiles`
// (para el login con Google la crea el callback por código), así que el
// usuario-sombra no la tiene todavía: por eso hacemos UPSERT, no UPDATE. Solo
// escribe si el perfil no estaba bloqueado ya, para no pisar una corrección de
// un admin. Sin nombre/apellido/dni no hace nada: se completará a mano en /profile.
export async function prefillCiditucProfile(
  userId: string,
  data: { nombre: string | null; apellido: string | null; documento: string; email: string | null }
): Promise<void> {
  const first_name = (data.nombre || '').trim()
  const last_name = (data.apellido || '').trim()
  const dni = dniFromDocumento(data.documento)
  if (!first_name || !last_name || !dni) return

  const svc = createServiceClient()

  // Si el perfil ya existe y está bloqueado, no lo pisamos.
  const { data: existing } = await svc
    .from('profiles')
    .select('profile_locked_at')
    .eq('id', userId)
    .maybeSingle()

  if (existing?.profile_locked_at) return

  const { error } = await svc
    .from('profiles')
    .upsert({
      id: userId,
      first_name,
      last_name,
      dni,
      full_name: `${first_name} ${last_name}`,
      email: data.email ?? null,
      profile_locked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    // 23505 = DNI ya registrado en otra cuenta. No bloqueamos el login por eso;
    // lo resolverá un admin. Cualquier otro error sí lo propagamos.
    if ((error as { code?: string }).code === '23505') {
      console.error('[cidituc] el DNI ya está registrado en otra cuenta; no se prellenó el perfil')
      return
    }
    throw new Error(error.message)
  }
}
