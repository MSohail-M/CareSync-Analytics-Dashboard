'use client'
import { useState } from 'react'
import Image from 'next/image'
import { signIn } from '@/lib/supabase-browser'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await signIn(email, password)
    if (err) { setError(err); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#F4F3EE', position: 'relative', overflow: 'hidden' }}>

      {/* ── Left panel — branding ─────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(145deg, #1B4F8C 0%, #0D3B72 50%, #082952 100%)',
        padding: '60px 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle geometric rings */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.025)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        {/* Glow orb */}
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)', top: '-60px', right: '-80px', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 70%)', bottom: '-40px', left: '-60px', filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '14px 24px', display: 'inline-flex', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
              <Image src="/caresync-logo.png" alt="CareSync" width={140} height={50} style={{ objectFit: 'contain' }} />
            </div>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            AI-Powered<br />Call Analytics
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
            Every inbound call analyzed, transcribed, and scored — so your clinic team stays focused on care.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48 }}>
            {[['100%','Calls Captured'],['< 1s','Analysis Time'],['99%','Uptime SLA']].map(([v,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3, letterSpacing: '0.03em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────── */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', background: 'white' }}>
        <div style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.32,0.72,0,1) both' }}>

          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(27,79,140,0.07)', border: '1px solid rgba(27,79,140,0.14)', borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'statusPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#1B4F8C', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Primary Coastal Care</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Sign in to your call analytics dashboard</p>
          </div>

          <form onSubmit={submit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '0.02em' }}>
                Email address
              </label>
              <div style={{
                border: `1.5px solid ${focused === 'email' ? '#1B4F8C' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 12, padding: '11px 14px',
                background: focused === 'email' ? 'rgba(27,79,140,0.02)' : '#FAFAF8',
                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                boxShadow: focused === 'email' ? '0 0 0 3px rgba(27,79,140,0.08)' : 'none',
              }}>
                <input type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@clinic.com"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '0.02em' }}>
                Password
              </label>
              <div style={{
                border: `1.5px solid ${focused === 'password' ? '#1B4F8C' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 12, padding: '11px 14px',
                background: focused === 'password' ? 'rgba(27,79,140,0.02)' : '#FAFAF8',
                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                boxShadow: focused === 'password' ? '0 0 0 3px rgba(27,79,140,0.08)' : 'none',
              }}>
                <input type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1B4F8C 0%, #2563EB 100%)',
              border: 'none', borderRadius: 12, padding: '13px 22px',
              fontSize: 14.5, fontWeight: 700, color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(27,79,140,0.35)',
            }}>
              {loading ? (
                <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign in <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></>
              )}
            </button>
          </form>

          <p style={{ fontSize: 12.5, color: '#9CA3AF', textAlign: 'center', marginTop: 24 }}>
            Need access? Contact your account manager.
          </p>
        </div>
      </div>
    </div>
  )
}
