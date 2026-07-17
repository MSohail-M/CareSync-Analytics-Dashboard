import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getClinic, getChats } from '@/lib/supabase'
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { CLINIC_TZ } from '@/lib/dates'
import type { CallListItem } from '@/lib/supabase'

function filterChats(chats: CallListItem[], period: string): CallListItem[] {
  const now = new Date()
  if (period === 'today') return chats.filter(c => c.started_at && new Date(c.started_at) >= startOfDay(now))
  if (period === 'week')  return chats.filter(c => c.started_at && new Date(c.started_at) >= startOfWeek(now))
  if (period === 'month') return chats.filter(c => c.started_at && new Date(c.started_at) >= startOfMonth(now))
  return chats
}

const PERIODS = [
  { value: 'all',   label: 'All Time' },
  { value: 'month', label: 'This Month' },
  { value: 'week',  label: 'This Week' },
  { value: 'today', label: 'Today' },
]

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  const { period = 'all' } = await searchParams
  const allChats = await getChats(500, clinic.id)
  const chats    = filterChats(allChats, period)

  return (
    <div className="page-pad" style={{ padding: '28px 28px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>Chat Logs</h1>
        </div>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
          Web chat conversations from the website widget · Click <strong style={{ color: '#0D9488' }}>View</strong> for full transcript
        </p>
      </div>

      {/* Period filter */}
      <Suspense>
        <ChatsFilterBar total={chats.length} period={period} />
      </Suspense>

      <div style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.08s both',
      }}>
        <ChatsTable chats={chats} />
      </div>
    </div>
  )
}

function ChatsFilterBar({ total, period }: { total: number; period: string }) {
  const chipBase: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 500,
    cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)',
    background: 'white', color: '#6B7280', transition: 'all .18s',
    textDecoration: 'none', display: 'inline-block',
  }
  const chipActive: React.CSSProperties = {
    ...chipBase, background: '#0D9488', color: 'white',
    border: '1px solid #0D9488', fontWeight: 600,
    boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</span>
        {PERIODS.map(p => (
          <a key={p.value} href={p.value === 'all' ? '/chats' : `/chats?period=${p.value}`} style={period === p.value ? chipActive : chipBase}>
            {p.label}
          </a>
        ))}
      </div>
      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 100, padding: '5px 14px', fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
        {total} conversations
      </div>
    </div>
  )
}

function ChatsTable({ chats }: { chats: CallListItem[] }) {
  if (chats.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0D9488' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No chat conversations yet</p>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>Chats from the website widget will appear here.</p>
      </div>
    )
  }

  const OUTCOME_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    booked:      { bg: 'rgba(5,150,105,0.08)',   color: '#059669', border: 'rgba(5,150,105,0.18)' },
    rescheduled: { bg: 'rgba(37,99,235,0.08)',   color: '#2563EB', border: 'rgba(37,99,235,0.18)' },
    transferred: { bg: 'rgba(217,119,6,0.08)',   color: '#D97706', border: 'rgba(217,119,6,0.18)' },
    failed:      { bg: 'rgba(220,38,38,0.07)',   color: '#DC2626', border: 'rgba(220,38,38,0.18)' },
    cancelled:   { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', border: 'rgba(107,114,128,0.18)' },
  }
  const SENTIMENT_COLOR: Record<string, string> = { Positive: '#059669', Neutral: '#6B7280', Negative: '#DC2626' }

  return (
    <table className="calls-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#F0FDFA' }}>
          {['Date & Time', 'Outcome', 'Sentiment', 'Patient', 'Summary', ''].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '11px 22px',
              fontSize: 10.5, color: '#0D9488',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontWeight: 700, borderBottom: '1px solid rgba(13,148,136,0.12)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {chats.map((chat, i) => {
          const outStyle  = chat.outcome ? (OUTCOME_STYLE[chat.outcome] ?? OUTCOME_STYLE.transferred) : null
          const sentColor = chat.user_sentiment ? SENTIMENT_COLOR[chat.user_sentiment] : undefined

          return (
            <tr key={chat.id} style={{
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(13,148,136,0.01)',
              transition: 'background 0.15s',
            }}>
              {/* Date */}
              <td style={{ padding: '12px 22px', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                  {chat.started_at ? new Date(chat.started_at).toLocaleDateString('en-US', { timeZone: CLINIC_TZ, month: 'short', day: 'numeric' }) : '—'}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {chat.started_at ? new Date(chat.started_at).toLocaleTimeString('en-US', { timeZone: CLINIC_TZ, hour: 'numeric', minute: '2-digit' }) : ''}
                </div>
              </td>

              {/* Outcome */}
              <td style={{ padding: '12px 22px' }}>
                {outStyle
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: outStyle.bg, color: outStyle.color, borderRadius: 100, padding: '3px 9px', fontSize: 11, fontWeight: 600, border: `1px solid ${outStyle.border}` }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: outStyle.color }} />
                      {chat.outcome!.charAt(0).toUpperCase() + chat.outcome!.slice(1)}
                    </span>
                  : <span style={{ color: '#D1D5DB', fontSize: 13 }}>—</span>
                }
              </td>

              {/* Sentiment */}
              <td style={{ padding: '12px 22px', fontSize: 13, fontWeight: sentColor ? 600 : 400, color: sentColor ?? '#D1D5DB' }}>
                {chat.user_sentiment ?? '—'}
              </td>

              {/* Patient */}
              <td style={{ padding: '12px 22px', fontSize: 13, color: '#374151' }}>
                {chat.patient_name ?? <span style={{ color: '#D1D5DB' }}>—</span>}
              </td>

              {/* Summary preview */}
              <td style={{ padding: '12px 22px', fontSize: 12.5, color: '#6B7280', maxWidth: 280 }}>
                {chat.call_summary
                  ? <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{chat.call_summary}</span>
                  : <span style={{ color: '#D1D5DB' }}>—</span>
                }
              </td>

              {/* View */}
              <td style={{ padding: '12px 22px' }}>
                <a href={`/chats/${chat.id}`} style={{ fontSize: 12.5, color: '#0D9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                  View
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
