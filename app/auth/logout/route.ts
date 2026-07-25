import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Usa el cliente estandar (anon key + cookies de sesion del usuario).
  // No hace falta la service role key solo para cerrar sesion.
  const supabase = await createClient()

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}
