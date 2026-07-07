import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function userClient() {
  const token = cookies().get('sb-token')?.value
  if (!token) return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function POST(_req: NextRequest) {
  // Verify caller is a dev-role user
  const uc = userClient()
  if (!uc) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { data: user } = await uc.from('users').select('role').maybeSingle()
  if (user?.role !== 'dev') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sb = serviceClient()

  // Count first so we can report how many were deleted
  const { count } = await sb.from('calls').select('*', { count: 'exact', head: true })

  // Delete all calls (cascades to nothing — call_traces are separate)
  const { error } = await sb.from('calls').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error('[clear-logs]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also clear call_traces
  await sb.from('call_traces').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ ok: true, deleted: count ?? 0 })
}
