import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const CLAUDE_MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are the CareSync AI Assistant — an intelligent analytics layer for the Primary Coastal Care voice agent dashboard.

You help owners, developers, and staff understand call outcomes, diagnose issues, and get AI-powered suggestions for fixing agent behavior problems.

## Your capabilities
- List and filter call logs (by date, outcome, patient, etc.)
- Pull full transcripts and AI summaries for specific calls
- Calculate daily/weekly statistics (success rate, transfer rate, avg duration, outcome breakdown)
- Identify patterns in failures and transfers
- Suggest prompt fixes when you find recurring issues

## Your role boundaries
- You are READ-ONLY in Phase 1 — you can analyze and suggest, but you do not modify the agent prompt or apply fixes
- When asked "why did this call transfer?" — look up the transcript and reason through it
- When multiple calls show the same failure pattern, surface it clearly

## Tone
Professional but conversational. Concise. Use bullet points for lists. Always ground your answers in actual call data from the tools.

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

const TOOLS = [
  {
    name: 'list_calls',
    description: 'List recent calls with outcome, duration, patient name, summary, and transfer reason. Use when asked about recent calls, call volume, success rate, or to find a specific call.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: 'Filter by specific date YYYY-MM-DD. Leave empty for all recent calls.' },
        limit: { type: 'number', description: 'Max calls to return (default 20, max 50)' },
        outcome: { type: 'string', description: 'Filter by outcome: booked | transferred | failed | cancelled | rescheduled' },
        patient_name: { type: 'string', description: 'Partial patient name search (case-insensitive)' },
      },
    },
  },
  {
    name: 'get_call_details',
    description: 'Get the full transcript, AI summary, outcome, and all metadata for a specific call. Use when asked about a specific call or to diagnose a transfer/failure.',
    input_schema: {
      type: 'object' as const,
      required: ['call_id'],
      properties: {
        call_id: { type: 'string', description: 'The call ID (UUID or retell_call_id starting with call_)' },
      },
    },
  },
  {
    name: 'get_daily_stats',
    description: 'Get aggregated statistics: total calls, success rate, outcome breakdown, avg duration, transfer rate. Use for summary questions like "how many calls today" or "what was success rate this week".',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: { type: 'string', description: 'Start date YYYY-MM-DD (defaults to today)' },
        days: { type: 'number', description: 'Number of days to include (default 1 = just that date, 7 = last 7 days)' },
      },
    },
  },
]

function serverClient(token: string) {
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

async function getClinicId(token: string): Promise<string | null> {
  const sb = serverClient(token)
  const { data } = await sb.from('clinics').select('id').maybeSingle()
  return data?.id ?? null
}

async function executeTool(name: string, input: Record<string, unknown>, clinicId: string): Promise<string> {
  const sb = serviceClient()

  if (name === 'list_calls') {
    const limit = Math.min(Number(input.limit ?? 20), 50)
    let q = sb.from('calls').select('id, retell_call_id, started_at, ended_at, duration_seconds, outcome, patient_name, call_summary, user_sentiment, call_successful, disconnection_reason, from_number')
      .eq('clinic_id', clinicId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (input.date) {
      const d = String(input.date)
      q = q.gte('started_at', `${d}T00:00:00`).lte('started_at', `${d}T23:59:59`)
    }
    if (input.outcome) {
      q = q.eq('outcome', String(input.outcome))
    }
    if (input.patient_name) {
      q = q.ilike('patient_name', `%${input.patient_name}%`)
    }

    const { data, error } = await q
    if (error) return `Error: ${error.message}`
    if (!data?.length) return 'No calls found matching that criteria.'

    const rows = data.map(c => {
      const dur = c.duration_seconds ? `${Math.round(c.duration_seconds / 60)}m` : '—'
      const date = c.started_at ? new Date(c.started_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
      return `[${c.id}] ${date} | ${c.outcome ?? 'unknown'} | ${c.patient_name ?? 'unknown patient'} | ${dur} | ${c.call_successful ? 'success' : 'not success'} | summary: ${c.call_summary?.slice(0, 100) ?? '—'}`
    }).join('\n')

    return `Found ${data.length} calls:\n\n${rows}`
  }

  if (name === 'get_call_details') {
    const callId = String(input.call_id)
    const { data, error } = await sb.from('calls').select('*')
      .eq('clinic_id', clinicId)
      .or(`id.eq.${callId},retell_call_id.eq.${callId}`)
      .maybeSingle()

    if (error) return `Error: ${error.message}`
    if (!data) return `No call found with ID: ${callId}`

    const dur = data.duration_seconds ? `${Math.round(data.duration_seconds / 60)} min ${data.duration_seconds % 60} sec` : '—'
    const date = data.started_at ? new Date(data.started_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

    return JSON.stringify({
      id: data.id,
      retell_call_id: data.retell_call_id,
      date,
      duration: dur,
      outcome: data.outcome,
      patient_name: data.patient_name,
      provider_name: data.provider_name,
      visit_type: data.visit_type,
      call_successful: data.call_successful,
      sentiment: data.user_sentiment,
      disconnection_reason: data.disconnection_reason,
      summary: data.call_summary,
      transcript: data.transcript,
    }, null, 2)
  }

  if (name === 'get_daily_stats') {
    const days = Number(input.days ?? 1)
    const dateStr = String(input.date ?? new Date().toISOString().slice(0, 10))
    const start = new Date(`${dateStr}T00:00:00`)
    const end = new Date(start)
    end.setDate(end.getDate() + days)

    const { data, error } = await sb.from('calls').select('outcome, call_successful, duration_seconds, started_at, disconnection_reason')
      .eq('clinic_id', clinicId)
      .gte('started_at', start.toISOString())
      .lt('started_at', end.toISOString())

    if (error) return `Error: ${error.message}`
    if (!data?.length) return `No calls found for ${dateStr}${days > 1 ? ` through ${days} days` : ''}.`

    const total = data.length
    const successful = data.filter(c => c.call_successful === true).length
    const outcomes: Record<string, number> = {}
    data.forEach(c => { const o = c.outcome ?? 'unknown'; outcomes[o] = (outcomes[o] ?? 0) + 1 })
    const durations = data.filter(c => c.duration_seconds).map(c => c.duration_seconds as number)
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const transferRate = outcomes['transferred'] ? ((outcomes['transferred'] / total) * 100).toFixed(1) : '0.0'
    const successRate = ((successful / total) * 100).toFixed(1)

    const label = days > 1 ? `${dateStr} (${days} days)` : dateStr
    return `Stats for ${label}:
- Total calls: ${total}
- Successful: ${successful} (${successRate}%)
- Transfer rate: ${transferRate}%
- Avg duration: ${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s
- Outcomes: ${Object.entries(outcomes).map(([k, v]) => `${k}=${v}`).join(', ')}`
  }

  return `Unknown tool: ${name}`
}

async function callClaude(messages: unknown[], retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      }),
    })
    if (res.ok) return res.json()
    if (res.status === 529 && i < retries - 1) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      continue
    }
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }
}

export async function POST(req: Request) {
  const token = cookies().get('sb-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinicId = await getClinicId(token)
  if (!clinicId) return NextResponse.json({ error: 'Clinic not found' }, { status: 403 })

  if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

  const { messages } = await req.json() as { messages: { role: string; content: unknown }[] }
  if (!messages?.length) return NextResponse.json({ error: 'messages required' }, { status: 400 })

  // Agentic loop — run up to 5 tool-call rounds
  const history = [...messages]
  for (let round = 0; round < 5; round++) {
    const response = await callClaude(history) as {
      content: { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[]
      stop_reason: string
    }

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find(b => b.type === 'text')?.text ?? ''
      return NextResponse.json({ reply: text })
    }

    if (response.stop_reason === 'tool_use') {
      // Add assistant turn with all content blocks
      history.push({ role: 'assistant', content: response.content })

      // Execute all tool calls
      const toolResults = await Promise.all(
        response.content
          .filter(b => b.type === 'tool_use')
          .map(async b => ({
            type: 'tool_result' as const,
            tool_use_id: b.id!,
            content: await executeTool(b.name!, b.input ?? {}, clinicId),
          }))
      )

      history.push({ role: 'user', content: toolResults })
      continue
    }

    // Unexpected stop reason — return whatever text is there
    const text = response.content.find(b => b.type === 'text')?.text ?? 'No response generated.'
    return NextResponse.json({ reply: text })
  }

  return NextResponse.json({ reply: 'Reached max tool-call rounds. Please try a more specific question.' })
}
