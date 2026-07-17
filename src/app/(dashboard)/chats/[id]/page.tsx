import { redirect } from 'next/navigation'
import { getClinic, getCall } from '@/lib/supabase'
import { fmtDateTimeET } from '@/lib/dates'
import { AudioPlayer } from '@/components/AudioPlayer'

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
    if (line.startsWith('Agent:')) return { role: 'Agent' as const, text: line.replace(/^Agent:\s*/, '') }
    if (line.startsWith('User:'))  return { role: 'User'  as const, text: line.replace(/^User:\s*/, '') }
    return null
  }).filter(Boolean) as { role: 'Agent' | 'User'; text: string }[]
}

export default async function ChatDetailPage({ params }: { params: { id: string } }) {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  const chat = await getCall(params.id)
  if (!chat) redirect('/chats')

  const transcript  = parseTranscript(chat.transcript)
  const outcomeColor = chat.outcome ? (OUTCOME_COLOR[chat.outcome] ?? '#6B7280') : '#6B7280'
  const outcomeBg    = chat.outcome ? (OUTCOME_BG[chat.outcome]    ?? 'rgba(107,114,128,0.08)') : 'rgba(107,114,128,0.08)'

  return (
    <div style={{ padding: '28px 28px 48px' }}>

      {/* Back */}
      <a href="/chats" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 20, fontWeight: 500, textDecoration: 'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Chat Logs
      </a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>Chat Detail</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
              {chat.started_at ? fmtDateTimeET(chat.started_at) : '—'}
            </p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.18)', borderRadius: 100, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, color: '#0D9488' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Web Chat
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Chat Info */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.06s both' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Chat Info</span>
          </div>
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Patient',      chat.patient_name ?? '—'],
              ['Provider',     chat.provider_name ?? '—'],
              ['Visit Type',   chat.visit_type ?? '—'],
              ['Channel',      'Website Widget'],
              ['Ended Reason', chat.disconnection_reason?.replace(/_/g, ' ') ?? '—'],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>
              </div>
            ))}

            {chat.outcome && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Outcome</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: outcomeBg, color: outcomeColor, borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, border: `1px solid ${outcomeColor}22` }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: outcomeColor }} />
                  {chat.outcome.charAt(0).toUpperCase() + chat.outcome.slice(1)}
                </span>
              </div>
            )}

            {chat.user_sentiment && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Visitor Sentiment</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SENTIMENT_BG[chat.user_sentiment] ?? 'transparent', borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: SENTIMENT_COLOR[chat.user_sentiment] ?? '#6B7280', border: `1px solid ${SENTIMENT_COLOR[chat.user_sentiment] ?? '#6B7280'}22` }}>
                  {chat.user_sentiment}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>Chat Successful</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: chat.call_successful ? '#059669' : '#DC2626' }}>
                {chat.call_successful === null ? '—' : chat.call_successful ? '✓ Yes' : '✗ No'}
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
            {chat.call_summary
              ? <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#374151' }}>{chat.call_summary}</p>
              : <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No AI summary available for this chat.</p>
            }
          </div>
        </div>
      </div>

      {/* Recording — only shown if Retell ever includes audio for chat */}
      {chat.recording_url && (
        <div style={{ marginBottom: 16, animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.16s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Recording</span>
          </div>
          <AudioPlayer url={chat.recording_url} />
        </div>
      )}

      {/* Transcript */}
      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.18s both' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Conversation Transcript</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', background: '#F0FDFA', borderRadius: 100, padding: '3px 10px', border: '1px solid rgba(13,148,136,0.1)' }}>{transcript.length} exchanges</span>
        </div>
        <div style={{ padding: '20px 22px', maxHeight: 480, overflowY: 'auto' }}>
          {transcript.length === 0 && (
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>Transcript not available for this chat.</p>
          )}
          {transcript.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, flexDirection: msg.role === 'User' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                background: msg.role === 'Agent' ? 'rgba(13,148,136,0.1)' : 'rgba(5,150,105,0.1)',
                color: msg.role === 'Agent' ? '#0D9488' : '#059669',
                border: `1px solid ${msg.role === 'Agent' ? 'rgba(13,148,136,0.18)' : 'rgba(5,150,105,0.18)'}`,
              }}>
                {msg.role === 'Agent' ? 'AI' : 'V'}
              </div>
              <div style={{
                background: msg.role === 'User' ? 'rgba(13,148,136,0.04)' : '#F9F8F5',
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
