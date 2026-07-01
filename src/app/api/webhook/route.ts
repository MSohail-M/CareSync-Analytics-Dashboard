import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function maskPhone(number: string | undefined): string {
  if (!number) return 'Unknown'
  const d = number.replace(/\D/g, '')
  if (d.length === 11) return `+${d[0]} (${d.slice(1, 4)}) ***-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 3)}) ***-${d.slice(6)}`
  return number.slice(0, 4) + '***' + number.slice(-4)
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function resolveClinicId(agentId: string, slug?: string): Promise<string | null> {
  const sb = supabase()
  if (slug) {
    const { data } = await sb.from('clinics').select('id').eq('slug', slug).maybeSingle()
    if (data?.id) return data.id
  }
  // Primary: check clinics table
  const { data: clinic } = await sb.from('clinics').select('id').eq('retell_agent_id', agentId).maybeSingle()
  if (clinic?.id) return clinic.id
  // Fallback: check clinic_agents table (handles Alice, Ava-Test, and any future agents)
  const { data: agent } = await sb.from('clinic_agents').select('clinic_id').eq('retell_agent_id', agentId).maybeSingle()
  return agent?.clinic_id ?? null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Verify signature if secret is set
  const secret = process.env.RETELL_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('x-retell-signature') ?? ''
    if (!verifySignature(rawBody, sig, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const payload = JSON.parse(rawBody)
  const event: string = payload.event
  const call = payload.call

  // ── call_ended: store the full call record ─────────────────────────────────
  if (event === 'call_ended') {
    const analysis = call.call_analysis ?? {}
    const custom   = analysis.custom_analysis_data ?? {}
    const clinicId = await resolveClinicId(call.agent_id, call.metadata?.clinic_slug)
    const duration = call.duration_ms ? Math.round(call.duration_ms / 1000) : null

    const { error } = await supabase().from('calls').upsert({
      clinic_id:            clinicId,
      retell_call_id:       call.call_id,
      retell_agent_id:      call.agent_id,
      started_at:           call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
      ended_at:             call.end_timestamp   ? new Date(call.end_timestamp).toISOString()   : null,
      duration_seconds:     duration,
      from_number:          maskPhone(call.from_number),
      call_summary:         analysis.call_summary     ?? null,
      user_sentiment:       analysis.user_sentiment   ?? null,
      call_successful:      analysis.call_successful  ?? null,
      in_voicemail:         analysis.in_voicemail     ?? false,
      disconnection_reason: call.disconnection_reason ?? null,
      outcome:              custom.outcome            ?? null,
      patient_name:         custom.patient_name       ?? null,
      provider_name:        custom.provider_name      ?? null,
      visit_type:           custom.visit_type         ?? null,
      transcript:           call.transcript           ?? null,
      recording_url:        call.recording_url        ?? null,
    }, { onConflict: 'retell_call_id' })

    if (error) {
      console.error('[call_ended]', error.message)
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, event })
  }

  // ── call_analyzed: Retell finished post-call analysis — update the record ──
  // This fires AFTER call_ended once AI analysis (summary, sentiment) is ready.
  if (event === 'call_analyzed') {
    const analysis = call.call_analysis ?? {}
    const custom   = analysis.custom_analysis_data ?? {}

    const { error } = await supabase().from('calls')
      .update({
        call_summary:    analysis.call_summary    ?? null,
        user_sentiment:  analysis.user_sentiment  ?? null,
        call_successful: analysis.call_successful ?? null,
        outcome:         custom.outcome           ?? null,
        patient_name:    custom.patient_name      ?? null,
        provider_name:   custom.provider_name     ?? null,
        visit_type:      custom.visit_type        ?? null,
      })
      .eq('retell_call_id', call.call_id)

    if (error) {
      console.error('[call_analyzed]', error.message)
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, event })
  }

  // All other events (call_started, etc.) — acknowledge and ignore
  return NextResponse.json({ ok: true, skipped: event })
}
