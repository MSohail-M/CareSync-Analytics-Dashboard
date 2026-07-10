// Server-only — reads JWT from cookie, uses it as Bearer token for Supabase queries
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export type Clinic = {
  id: string; slug: string; name: string
  retell_agent_id: string | null; phone_number: string | null
  plan_tier: string; status: string; created_at: string
}

export type Call = {
  id: string; clinic_id: string; retell_call_id: string
  started_at: string | null; ended_at: string | null; duration_seconds: number | null
  from_number: string | null; call_summary: string | null
  user_sentiment: string | null; call_successful: boolean | null
  in_voicemail: boolean; disconnection_reason: string | null
  outcome: string | null; patient_name: string | null
  provider_name: string | null; visit_type: string | null
  transcript: string | null; recording_url: string | null; created_at: string
}

function serverClient() {
  const token = cookies().get('sb-token')?.value
  if (!token) return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getClinic(): Promise<Clinic | null> {
  noStore()
  const sb = serverClient()
  if (!sb) return null
  const { data } = await sb.from('clinics').select('*').maybeSingle()
  return data ?? null
}

async function getAgentIdsByType(type: 'voice' | 'chat'): Promise<string[]> {
  const clinic = await getClinic()
  if (!clinic) return []
  const sb = serviceClient()
  const { data } = await sb.from('clinic_agents')
    .select('retell_agent_id')
    .eq('clinic_id', clinic.id)
    .eq('type', type)
  return (data ?? []).map((r: { retell_agent_id: string }) => r.retell_agent_id)
}

export async function getCalls(limit = 200): Promise<Call[]> {
  noStore()
  const sb = serverClient()
  if (!sb) return []
  const chatIds = await getAgentIdsByType('chat')
  let q = sb.from('calls').select('*').order('started_at', { ascending: false }).limit(limit)
  if (chatIds.length > 0) q = q.not('retell_agent_id', 'in', `(${chatIds.join(',')})`)
  const { data } = await q
  return data ?? []
}

export async function getChats(limit = 200): Promise<Call[]> {
  noStore()
  const sb = serverClient()
  if (!sb) return []
  const chatIds = await getAgentIdsByType('chat')
  if (chatIds.length === 0) return []
  const { data } = await sb.from('calls').select('*')
    .in('retell_agent_id', chatIds)
    .order('started_at', { ascending: false }).limit(limit)
  return data ?? []
}

export type ClinicAgent = {
  id: string; clinic_id: string; retell_agent_id: string
  label: string | null; created_at: string
}

export type AppUser = {
  id: string; clinic_id: string; role: string; name: string | null; created_at: string
}

export async function getCurrentUser(): Promise<AppUser | null> {
  noStore()
  const sb = serverClient()
  if (!sb) return null
  const { data } = await sb.from('users').select('*').maybeSingle()
  return data ?? null
}

export async function getCall(id: string): Promise<Call | null> {
  noStore()
  const sb = serverClient()
  if (!sb) return null
  const { data } = await sb.from('calls').select('*')
    .or(`id.eq.${id},retell_call_id.eq.${id}`).maybeSingle()
  return data ?? null
}

export async function getAdjacentCalls(
  startedAt: string,
): Promise<{ prevId: string | null; nextId: string | null }> {
  noStore()
  const sb = serverClient()
  if (!sb) return { prevId: null, nextId: null }

  const chatIds = await getAgentIdsByType('chat')

  let prevQ = sb.from('calls').select('id').gt('started_at', startedAt).order('started_at', { ascending: true }).limit(1)
  let nextQ = sb.from('calls').select('id').lt('started_at', startedAt).order('started_at', { ascending: false }).limit(1)
  if (chatIds.length > 0) {
    prevQ = prevQ.not('retell_agent_id', 'in', `(${chatIds.join(',')})`)
    nextQ = nextQ.not('retell_agent_id', 'in', `(${chatIds.join(',')})`)
  }

  const [prevRes, nextRes] = await Promise.all([prevQ, nextQ])

  return {
    prevId: (prevRes.data?.[0]?.id as string) ?? null,
    nextId: (nextRes.data?.[0]?.id as string) ?? null,
  }
}
