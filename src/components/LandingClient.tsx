'use client'
import Image from 'next/image'
import Link from 'next/link'

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    color: '#1B4F8C', bg: 'rgba(27,79,140,0.08)', border: 'rgba(27,79,140,0.14)',
    title: 'Real-Time Call Analysis',
    desc: 'Every call transcribed and scored the moment it ends. No manual review needed.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.14)',
    title: 'Patient Sentiment',
    desc: 'AI detects emotional tone — positive, neutral, or negative — so nothing slips through.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.14)',
    title: 'Booking Outcomes',
    desc: 'Track booked, transferred, cancelled, and failed calls with full patient context.',
  },
]

export default function LandingClient() {
  return (
    <div style={{ minHeight: '100dvh', background: '#F4F3EE', color: '#111827' }}>

      {/* ── Nav ─────────────────────────────── */}
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/caresync-logo.png" alt="CareSync" width={120} height={42} style={{ objectFit: 'contain' }} />
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #1B4F8C, #2563EB)',
            borderRadius: 100, padding: '9px 22px', fontSize: 13.5, fontWeight: 600, color: 'white',
            boxShadow: '0 4px 12px rgba(27,79,140,0.28)',
          }}>
            Sign in →
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 48px 72px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.15)', borderRadius: 100, padding: '5px 14px', marginBottom: 28, animation: 'fadeSlideUp 0.6s cubic-bezier(0.32,0.72,0,1) 0.1s both' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'statusPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1B4F8C', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Primary Coastal Care · AI Analytics</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,5.5vw,60px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 22, animation: 'heroReveal 0.8s cubic-bezier(0.32,0.72,0,1) 0.2s both' }}>
          Every call, analyzed.<br />
          <span style={{ background: 'linear-gradient(135deg, #1B4F8C 0%, #0D9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nothing missed.</span>
        </h1>

        <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.65, maxWidth: 540, margin: '0 auto 44px', animation: 'fadeSlideUp 0.7s cubic-bezier(0.32,0.72,0,1) 0.35s both' }}>
          Your AI receptionist logs, transcribes, and scores every inbound call — so your team can focus on patients, not paperwork.
        </p>

        <div style={{ animation: 'fadeSlideUp 0.7s cubic-bezier(0.32,0.72,0,1) 0.5s both' }}>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #1B4F8C 0%, #2563EB 100%)',
            borderRadius: 14, padding: '14px 32px',
            fontSize: 15, fontWeight: 700, color: 'white',
            boxShadow: '0 6px 20px rgba(27,79,140,0.32)',
          }}>
            Access Dashboard
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 60, animation: 'fadeSlideUp 0.7s cubic-bezier(0.32,0.72,0,1) 0.6s both' }}>
          {[['100%','Calls Captured'],['< 1s','Analysis Time'],['99%','Uptime SLA']].map(([v,l], i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(0,0,0,0.1)', margin: '0 36px' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>{v}</div>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 3 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 20,
              padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              animation: `fadeSlideUp 0.6s cubic-bezier(0.32,0.72,0,1) ${0.1+i*0.1}s both`,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 48px 80px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #1B4F8C 0%, #0D3B72 100%)', borderRadius: 24, padding: '52px 48px', boxShadow: '0 12px 40px rgba(27,79,140,0.25)' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.025em', marginBottom: 12 }}>Your calls are waiting</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 36, lineHeight: 1.6 }}>Sign in to see live analytics, transcripts, and AI patient insights.</p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'white', borderRadius: 12, padding: '13px 30px',
            fontSize: 14.5, fontWeight: 700, color: '#1B4F8C',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            Go to Dashboard →
          </Link>
        </div>
        <p style={{ marginTop: 28, fontSize: 12, color: '#9CA3AF' }}>CareSync · Primary Coastal Care · AI Call Analytics</p>
      </section>
    </div>
  )
}
