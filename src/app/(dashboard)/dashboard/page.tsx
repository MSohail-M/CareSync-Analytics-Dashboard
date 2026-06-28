import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getClinic, getCalls } from '@/lib/supabase'
import { format, formatDistanceToNow, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import type { Call } from '@/lib/supabase'

/* ── Outcome / Sentiment maps ───────────────────── */
const OUTCOME_STYLE: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  booked:      { bg: 'rgba(5,150,105,0.08)',   color: '#059669', dot: '#059669', border: 'rgba(5,150,105,0.18)' },
  rescheduled: { bg: 'rgba(37,99,235,0.08)',   color: '#2563EB', dot: '#2563EB', border: 'rgba(37,99,235,0.18)' },
  transferred: { bg: 'rgba(217,119,6,0.08)',   color: '#D97706', dot: '#D97706', border: 'rgba(217,119,6,0.18)' },
  failed:      { bg: 'rgba(220,38,38,0.07)',   color: '#DC2626', dot: '#DC2626', border: 'rgba(220,38,38,0.18)' },
  cancelled:   { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', dot: '#6B7280', border: 'rgba(107,114,128,0.18)' },
}

const SENTIMENT: Record<string, { color: string; bar: string; label: string }> = {
  Positive: { color: '#059669', bar: '#10B981', label: '😊 Positive' },
  Neutral:  { color: '#6B7280', bar: '#9CA3AF', label: '😐 Neutral'  },
  Negative: { color: '#DC2626', bar: '#EF4444', label: '😞 Negative' },
}

function Badge({ label, style }: { label: string; style: { bg: string; color: string; dot: string; border: string } }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: style.bg, color: style.color, borderRadius: 100, padding: '3px 9px', fontSize: 11, fontWeight: 600, border: `1px solid ${style.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: style.dot }} />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  )
}

function dur(s: number | null) {
  if (!s) return '—'
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

/* ── Bento stat card ────────────────────────────── */
function StatCard({
  label, value, sub, accent = '#1B4F8C',
  icon, delay = '0s', large = false,
}: {
  label: string; value: string | number; sub?: string
  accent?: string; icon: React.ReactNode; delay?: string; large?: boolean
}) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 18,
      padding: large ? '28px 28px 24px' : '22px 22px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
      animation: `fadeSlideUp 0.55s cubic-bezier(0.32,0.72,0,1) ${delay} both`,
    }}>
      {/* Subtle colour strip at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}66)`, borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: large ? 20 : 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}12`, border: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: large ? 48 : 38, fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{sub}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  const calls = await getCalls(500)
  const now   = new Date()

  const inPeriod = (c: Call, from: Date) => c.started_at ? new Date(c.started_at) >= from : false
  const todayCalls  = calls.filter(c => inPeriod(c, startOfDay(now)))
  const weekCalls   = calls.filter(c => inPeriod(c, startOfWeek(now)))
  const monthCalls  = calls.filter(c => inPeriod(c, startOfMonth(now)))

  const booked      = monthCalls.filter(c => c.outcome === 'booked').length
  const transferred = monthCalls.filter(c => c.outcome === 'transferred').length
  const failed      = monthCalls.filter(c => c.outcome === 'failed').length
  const successful  = monthCalls.filter(c => c.call_successful === true).length
  const successRate = monthCalls.length > 0 ? Math.round((successful / monthCalls.length) * 100) : 0
  const transferRate = monthCalls.length > 0 ? Math.round((transferred / monthCalls.length) * 100) : 0

  const avgDur = monthCalls.length > 0
    ? Math.round(monthCalls.reduce((a, c) => a + (c.duration_seconds ?? 0), 0) / monthCalls.length)
    : 0

  const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 }
  monthCalls.forEach(c => {
    if (c.user_sentiment && c.user_sentiment in sentimentCounts)
      sentimentCounts[c.user_sentiment as keyof typeof sentimentCounts]++
  })

  const recent = calls.slice(0, 8)

  return (
    <div style={{ padding: '28px 28px 48px' }}>

      {/* ── Header ─────────────────────────────── */}
      <div style={{ marginBottom: 26, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Welcome, {clinic.name}
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
              {format(now, 'EEEE, MMMM d yyyy')} · Call Analytics Overview
            </p>
          </div>
          {/* Agent pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: clinic.retell_agent_id ? 'rgba(5,150,105,0.07)' : 'rgba(217,119,6,0.07)',
            border: `1px solid ${clinic.retell_agent_id ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}`,
            borderRadius: 100, padding: '7px 16px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: clinic.retell_agent_id ? '#059669' : '#D97706', boxShadow: `0 0 6px ${clinic.retell_agent_id ? '#059669' : '#D97706'}`, animation: 'statusPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: clinic.retell_agent_id ? '#059669' : '#D97706' }}>
              {clinic.retell_agent_id ? 'AI Agent Live' : 'Setup Pending'}
            </span>
            {clinic.phone_number && <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>· {clinic.phone_number}</span>}
          </div>
        </div>
      </div>

      {/* ── Bento stat grid ─────────────────────── */}
      {/* Row 1: 4 equal columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
        <StatCard label="Calls Today" value={todayCalls.length} sub={`${weekCalls.length} this week`} accent="#1B4F8C" delay="0.06s"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.03a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.81 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
        />
        <StatCard label="Booked This Month" value={booked} sub={`of ${monthCalls.length} total calls`} accent="#059669" delay="0.12s"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard label="Success Rate" value={`${successRate}%`} sub={`${successful} successful calls`} accent={successRate >= 70 ? '#059669' : successRate >= 50 ? '#D97706' : '#DC2626'} delay="0.18s"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard label="Avg Duration" value={dur(avgDur)} sub="per call this month" accent="#D97706" delay="0.24s"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      </div>

      {/* ── Second row: Sentiment + Metrics + Quick stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 14, marginBottom: 14 }}>

        {/* Patient Sentiment */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.55s cubic-bezier(0.32,0.72,0,1) 0.28s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Patient Sentiment</h3>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>This month · {monthCalls.length} calls</span>
          </div>
          {Object.entries(sentimentCounts).map(([s, count]) => {
            const pct = monthCalls.length > 0 ? Math.round((count / monthCalls.length) * 100) : 0
            const st = SENTIMENT[s]
            return (
              <div key={s} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{st.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: st.color }}>{pct}% <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>({count})</span></span>
                </div>
                <div style={{ height: 7, background: '#F3F4F6', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: st.bar, borderRadius: 100, animation: 'barGrow 0.8s cubic-bezier(0.32,0.72,0,1) both' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Call Metrics */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeSlideUp 0.55s cubic-bezier(0.32,0.72,0,1) 0.34s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Call Metrics</h3>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>This month</span>
          </div>
          {[
            { label: 'Total Calls',      value: monthCalls.length, color: '#111827' },
            { label: 'This Week',        value: weekCalls.length,  color: '#1B4F8C' },
            { label: 'Booked',           value: booked,            color: '#059669' },
            { label: 'Transferred',      value: transferred,       color: '#D97706' },
            { label: 'Failed',           value: failed,            color: '#DC2626' },
            { label: 'Transfer Rate',    value: `${transferRate}%`, color: transferRate > 25 ? '#D97706' : '#374151' },
          ].map((r, i) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Quick highlights — Crextio-style big numbers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Today', value: todayCalls.length, color: '#1B4F8C', sub: 'calls' },
            { label: 'This Week', value: weekCalls.length, color: '#0D9488', sub: 'calls' },
            { label: 'This Month', value: monthCalls.length, color: '#D97706', sub: 'calls' },
          ].map((h, i) => (
            <div key={h.label} style={{
              background: 'white', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16, padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: `fadeSlideUp 0.55s cubic-bezier(0.32,0.72,0,1) ${0.28 + i * 0.07}s both`,
            }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{h.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{h.sub}</div>
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: h.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{h.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Calls table ───────────────────── */}
      <div style={{
        background: 'white', border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: 'fadeSlideUp 0.55s cubic-bezier(0.32,0.72,0,1) 0.5s both',
      }}>
        {/* Table header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Recent Calls</h3>
          <Link href="/calls" style={{ fontSize: 12.5, color: '#1B4F8C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAFAF8' }}>
              {['Time', 'Caller', 'Outcome', 'Sentiment', 'Duration', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 24px', fontSize: 10.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                No calls yet. Your AI receptionist will log calls here automatically.
              </td></tr>
            )}
            {recent.map((call, i) => {
              const outStyle = call.outcome ? (OUTCOME_STYLE[call.outcome] ?? OUTCOME_STYLE.transferred) : null
              const sent = call.user_sentiment ? SENTIMENT[call.user_sentiment] : null
              return (
                <tr key={call.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', animation: `fadeSlideUp 0.4s cubic-bezier(0.32,0.72,0,1) ${0.52 + i * 0.03}s both` }}>
                  <td style={{ padding: '13px 24px', fontSize: 12.5, color: '#6B7280' }}>
                    {call.started_at ? formatDistanceToNow(new Date(call.started_at), { addSuffix: true }) : '—'}
                  </td>
                  <td style={{ padding: '13px 24px', fontSize: 13, color: '#111827', fontWeight: 600 }}>
                    {call.from_number ?? '—'}
                  </td>
                  <td style={{ padding: '13px 24px' }}>
                    {outStyle ? <Badge label={call.outcome!} style={outStyle} /> : <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 24px', fontSize: 13, fontWeight: 600, color: sent?.color ?? '#9CA3AF' }}>
                    {sent ? sent.label : '—'}
                  </td>
                  <td style={{ padding: '13px 24px', fontSize: 13, color: '#6B7280' }}>
                    {dur(call.duration_seconds)}
                  </td>
                  <td style={{ padding: '13px 24px' }}>
                    <Link href={`/calls/${call.id}`} style={{ fontSize: 12.5, color: '#1B4F8C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      View <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
