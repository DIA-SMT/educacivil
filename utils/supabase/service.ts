import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase con la SERVICE ROLE KEY. Bypassa RLS, así que es SOLO para
// uso server-side (route handlers, server components protegidos). NUNCA exponer
// al browser ni usar la key en código cliente.
//
// Se usa para la trazabilidad de CiDiTuc (tabla cidituc_users), que no pasa por
// Supabase Auth y por eso no es accesible con el cliente anónimo normal.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno'
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
