import { cookies } from 'next/headers'
import {
  CIDITUC_SESSION_COOKIE,
  verifySession,
  type CiditucSession,
} from '@/lib/cidituc'

// Lee y verifica la sesión de CiDiTuc desde la cookie (para Server Components,
// route handlers y server actions). Devuelve null si no hay sesión válida.
export async function getCiditucSession(): Promise<CiditucSession | null> {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(CIDITUC_SESSION_COOKIE)?.value)
}

// Borra la cookie de sesión de CiDiTuc.
export async function clearCiditucSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CIDITUC_SESSION_COOKIE)
}
