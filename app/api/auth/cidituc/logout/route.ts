import { NextResponse } from 'next/server'
import { clearCiditucSession } from '@/lib/cidituc-server'

// Cierra la sesión de CiDiTuc borrando la cookie httpOnly (el cliente no puede).
export async function POST() {
  await clearCiditucSession()
  return NextResponse.json({ ok: true })
}
