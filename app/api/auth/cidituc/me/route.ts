import { NextResponse } from 'next/server'
import { getCiditucSession } from '@/lib/cidituc-server'

// Devuelve el usuario logueado con CiDiTuc (o null). Lo consume el header,
// que es un client component y no puede leer la cookie httpOnly directamente.
export async function GET() {
  const session = await getCiditucSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({
    user: {
      dni: session.dni,
      nombre: session.nombre,
      apellido: session.apellido,
      email: session.email,
    },
  })
}
