'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MiniPlayer } from '@/components/AudioPlayer'
import type { Call } from '@/lib/supabase'

const OUTCOME_STYLE: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  booked:      { bg: 'rgba(5,150,105,0.08)',   color: '#059669', dot: '#059669', border: 'rgba(5,150,105,0.18)' },
  rescheduled: { bg: 'rgba(37,99,235,0.08)',   color: '#2563EB', dot: '#2563EB', border: 'rgba(37,99,235,0.18)' },
  transferred: { bg: 'rgba(217,119,6,0.08)',   color: '#D97706', dot: '#D97706', border: 'rgba(217,119,6,0.18)' },
  failed:      { bg: 'rgba(220,38,38,0.07)',   color: '#DC2626', dot: '#DC2626', border: 'rgba(220,38,38,0.18)' },
  cancelled:   { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', dot: '#6B7280', border: 'rgba(107,114,128,0.18)' },
}

const SENTIMENT_COLOR: Record<string, string> = {
  Positive: '#059669', Neutral: '#6B7280', Negative: '#DC2626',
}

function dur(s: number | null) {
  if (!s) return '—'
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function CallsTable({ calls }: { calls: Call[] }) {
  const [activePlayer, setActivePlayer] = useState<string | null>(null)

  if (calls.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        No calls match the selected filters.
      </div>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#FAFAF8' }}>
          {['Date & Time', 'Caller', 'Outcome', 'Sentiment', 'Patient', 'Provider', 'Duration', 'Recording', ''].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '11px 22px',
              fontSize: 10.5, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calls.map(call => {
          const outStyle   = call.outcome ? (OUTCOME_STYLE[call.outcome] ?? OUTCOME_STYLE.transferred) : null
          const sentColor  = call.user_sentiment ? SENTIMENT_COLOR[call.user_sentiment] : undefined
          const hasAudio   = Boolean(call.recording_url)
          const isActive   = activePlayer === call.id

          return (
            <tr key={call.id} style={{
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              background: isActive ? 'rgba(27,79,140,0.02)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              {/* Date */}
              <td style={{ padding: '12px 22px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                  {call.started_at ? format(new Date(call.started_at), 'MMM d') : '—'}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {call.started_at ? format(new Date(call.started_at), 'h:mm a') : ''}
                </div>
              </td>

              {/* Caller */}
              <td style={{ padding: '12px 22px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                {call.from_number ?? '—'}
              </td>

              {/* Outcome */}
              <td style={{ padding: '12px 22px' }}>
                {outStyle
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: outStyle.bg, color: outStyle.color, borderRadius: 100, padding: '3px 9px', fontSize: 11, fontWeight: 600, border: `1px solid ${outStyle.border}` }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: outStyle.dot }} />
                      {call.outcome!.charAt(0).toUpperCase() + call.outcome!.slice(1)}
                    </span>
                  : <span style={{ color: '#D1D5DB', fontSize: 13 }}>—</span>
                }
              </td>

              {/* Sentiment */}
              <td style={{ padding: '12px 22px', fontSize: 13, fontWeight: sentColor ? 600 : 400, color: sentColor ?? '#D1D5DB' }}>
                {call.user_sentiment ?? '—'}
              </td>

              {/* Patient */}
              <td style={{ padding: '12px 22px', fontSize: 13, color: '#374151' }}>
                {call.patient_name ?? <span style={{ color: '#D1D5DB' }}>—</span>}
              </td>

              {/* Provider */}
              <td style={{ padding: '12px 22px', fontSize: 13, color: '#374151' }}>
                {call.provider_name ?? <span style={{ color: '#D1D5DB' }}>—</span>}
              </td>

              {/* Duration */}
              <td style={{ padding: '12px 22px', fontSize: 13, color: '#6B7280' }}>
                {dur(call.duration_seconds)}
              </td>

              {/* Recording — mini player */}
              <td style={{ padding: '12px 22px', minWidth: hasAudio ? (isActive ? 200 : 48) : 'auto', transition: 'min-width 0.25s cubic-bezier(0.32,0.72,0,1)' }}>
                {hasAudio
                  ? <MiniPlayer
                      url={call.recording_url!}
                      isActive={isActive}
                      onActivate={() => setActivePlayer(call.id)}
                    />
                  : <span style={{ fontSize: 12, color: '#D1D5DB' }}>No recording</span>
                }
              </td>

              {/* View link */}
              <td style={{ padding: '12px 22px' }}>
                <Link href={`/calls/${call.id}`} style={{ fontSize: 12.5, color: '#1B4F8C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  View
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
