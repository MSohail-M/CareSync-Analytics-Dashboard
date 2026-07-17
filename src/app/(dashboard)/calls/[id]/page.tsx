import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getClinic, getCall, getAdjacentCalls } from '@/lib/supabase'
import { fmtDateTimeET } from '@/lib/dates'
import { AudioPlayer } from '@/components/AudioPlayer'

function dur(s: number | null) { if (!s) return '—'; return `${Math.floor(s/60)}m ${s%60}s` }

const OUTCOME_COLOR: Record<string, string> = {
  booked: '#059669', rescheduled: '#2563EB', transferred: '#D97706', failed: '#DC2626', cancelled: '#6B7280',
}
const OUTCOME_BG: Record<string, string> = {
  booked: 'rgba(5,150,105,0.08)', rescheduled: 'rgba(37,99,235,0.08)', transferred: 'rgba(217,119,6,0.08)',
  failed: 'rgba(220,38,38,0.07)', cancelled: 'rgba(107,114,128,0.08)',
}
const SENTIMENT_COLOR: Record<string, string> = { Positive: '#059669', Neutral: '#6B7280', Negative: '#DC2626' }
const SENTIMENT_BG: Record<string, string> = { Positive: 'rgba(5,150,105,0.07)', Neutral: 'rgba(107,114,128,0.07)', Negative: 'rgba(220,38,38,0.07)' }

function parseTranscript(raw: string | null): { role: 'Agent' | 'User'; text: string }[] {
  if (!raw) return []
  return raw.split('\n').filter(l => l.trim()).map(line => {
    if (line.startsWith('Agent:')) return { role: 'Agent' as const, text: line.replace(/^Agent:\s*/,'') }
    if (line.startsWith('User:'))  return { role: 'User'  as const, text: line.replace(/^User:\s*/,'') }
    return null
  }).filter(Boolean) as { role: 'Agent' | 'User'; text: string }[]
}

export default async function CallDetailPage({ params }: { params: { id: string } }) {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  const call = await getCall(params.id)
  if (!call) redirect('/calls')

  const { prevId, nextId } = await getAdjacentCalls(call.started_at ?? call.created_at, clinic.id)
  const transcript = parseTranscript(call.transcript)
  const outcomeColor = call.outcome ? (OUTCOME_COLOR[call.outcome] ?? '#6B7280') : '#6B7280'
  const outcomeBg    = call.outcome ? (OUTCOME_BG[call.outcome]    ?? 'rgba(107,114,128,0.08)') : 'rgba(107,114,128,0.08)'

  return (
    <div style={{ padding: '28px 28px 48px' }}>

      {/* Nav bar: back + prev/next */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <Link href="/calls" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Call Logs
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {prevId ? (
            <Link href={`/calls/${prevId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1B4F8C', background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.15)', borderRadius: 8, padding: '7px 13px', textDecoration: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Newer
            </Link>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#D1D5DB', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 13px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Newer
            </span>
          )}
          {nextId ? (
            <Link href={`/calls/${nextId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1B4F8C', background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.15)', borderRadius: 8, padding: '7px 13px', textDecoration: 'none' }}>
              Older
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#D1D5DB', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 13px' }}>
              Older
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>Call Detail</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
            {call.started_at ? fmtDateTimeET(call.started_at) : '—'} · {dur(call.duration_seconds)}
          </p>
        </div>
        {/* Recording badge (pill) */}
        {call.recording_url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 100, padding: '6px 14px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px #059669', animation: 'statusPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#059669' }}>Recording available</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Call Info */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.06s both' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(27,79,140,0.08)', border: '1px solid rgba(27,79,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4F8C' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.03a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.81 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Call Info</span>
          </div>
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Caller',         call.from_number ?? '—'],
              ['Patient',        call.patient_name ?? '—'],
              ['Provider',       call.provider_name ?? '—'],
              ['Visit Type',     call.visit_type ?? '—'],
              ['Duration',       dur(call.duration_seconds)],
              ['Ended Reason',   call.disconnection_reason?.replace(/_/g,' ') ?? '—'],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>
              </div>
            ))}

            {call.outcome && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Outcome</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: outcomeBg, color: outcomeColor, borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, border: `1px solid ${outcomeColor}22` }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: outcomeColor }} />
                  {call.outcome.charAt(0).toUpperCase() + call.outcome.slice(1)}
                </span>
              </div>
            )}

            {call.user_sentiment && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Patient Sentiment</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SENTIMENT_BG[call.user_sentiment] ?? 'transparent', borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: SENTIMENT_COLOR[call.user_sentiment] ?? '#6B7280', border: `1px solid ${SENTIMENT_COLOR[call.user_sentiment] ?? '#6B7280'}22` }}>
                  {call.user_sentiment}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Call Successful</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: call.call_successful ? '#059669' : '#DC2626' }}>
                {call.call_successful === null ? '—' : call.call_successful ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.12s both' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>AI Summary</span>
          </div>
          <div style={{ padding: '20px 22px' }}>
            {call.call_summary
              ? <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#374151' }}>{call.call_summary}</p>
              : <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No AI summary available for this call.</p>
            }
            {call.in_voicemail && (
              <div style={{ marginTop: 16, background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.18)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#D97706', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                This call reached voicemail
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Audio Player ─────────────────────────── */}
      {call.recording_url && (
        <div style={{ marginBottom: 16, animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.16s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4F8C' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Call Recording</span>
            <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>· Use 1.5× or 2× speed to review quickly</span>
          </div>
          <AudioPlayer url={call.recording_url} />
        </div>
      )}

      {/* Transcript */}
      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.18s both' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4F8C' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Conversation Transcript</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', background: '#F4F3EE', borderRadius: 100, padding: '3px 10px' }}>{transcript.length} exchanges</span>
        </div>
        <div style={{ padding: '20px 22px', maxHeight: 480, overflowY: 'auto' }}>
          {transcript.length === 0 && (
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>Transcript not available for this call.</p>
          )}
          {transcript.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, flexDirection: msg.role === 'User' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                background: msg.role === 'Agent' ? 'rgba(27,79,140,0.1)' : 'rgba(5,150,105,0.1)',
                color: msg.role === 'Agent' ? '#1B4F8C' : '#059669',
                border: `1px solid ${msg.role === 'Agent' ? 'rgba(27,79,140,0.18)' : 'rgba(5,150,105,0.18)'}`,
              }}>
                {msg.role === 'Agent' ? 'AI' : 'P'}
              </div>
              <div style={{
                background: msg.role === 'User' ? 'rgba(5,150,105,0.05)' : '#F9F8F5',
                border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12,
                padding: '10px 14px', fontSize: 13, lineHeight: 1.55, maxWidth: '75%', color: '#374151',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
