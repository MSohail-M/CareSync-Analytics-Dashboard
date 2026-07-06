'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/supabase-browser'
import type { Clinic } from '@/lib/supabase'

const NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/calls',
    label: 'Call Logs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.03a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.81 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    href: '/chats',
    label: 'Chat Logs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

export default function Sidebar({ clinic }: { clinic: Clinic }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const agentLive = !!clinic.retell_agent_id
  const agentColor = agentLive ? '#059669' : '#D97706'
  const agentBg    = agentLive ? 'rgba(5,150,105,0.07)'  : 'rgba(217,119,6,0.07)'
  const agentBdr   = agentLive ? 'rgba(5,150,105,0.18)'  : 'rgba(217,119,6,0.18)'
  const agentLabel = agentLive ? 'AI Agent Live' : 'Setup Pending'

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────── */}
      <div className="mobile-header">
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#374151', display: 'flex', alignItems: 'center' }}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <Image src="/caresync-logo.png" alt="CareSync" width={100} height={35} style={{ objectFit: 'contain' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: agentBg, border: `1px solid ${agentBdr}`, borderRadius: 100, padding: '4px 10px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: agentColor, boxShadow: `0 0 5px ${agentColor}`, animation: 'statusPulse 2.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: agentColor }}>{agentLabel}</span>
        </div>
      </div>

      {/* ── Mobile backdrop ─────────────────────────── */}
      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`sidebar-drawer${open ? ' open' : ''}`} style={{
        width: 228,
        background: 'white',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        boxShadow: '1px 0 0 rgba(0,0,0,0.04)',
      }}>

        {/* Logo + mobile close */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/caresync-logo.png" alt="CareSync" width={110} height={38} style={{ objectFit: 'contain', display: 'block' }} />
          <button
            onClick={close}
            className="mobile-close-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 6, display: 'none' }}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Clinic card */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Active Clinic
          </div>
          <div style={{ background: '#F4F3EE', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2, letterSpacing: '-0.01em' }}>{clinic.name}</div>
            {clinic.phone_number && (
              <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.03a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.81 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {clinic.phone_number}
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>
            Menu
          </div>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} onClick={close} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 11px', borderRadius: 10, marginBottom: 3,
                color: active ? '#1B4F8C' : '#6B7280',
                background: active ? 'rgba(27,79,140,0.07)' : 'transparent',
                border: `1px solid ${active ? 'rgba(27,79,140,0.14)' : 'transparent'}`,
                fontSize: 13, fontWeight: active ? 600 : 500,
                transition: 'all 0.18s cubic-bezier(0.32,0.72,0,1)',
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: active ? 'rgba(27,79,140,0.1)' : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Agent status */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: agentBg, border: `1px solid ${agentBdr}`, borderRadius: 9, padding: '8px 12px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: agentColor, boxShadow: `0 0 6px ${agentColor}`, animation: 'statusPulse 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: agentColor }}>{agentLabel}</span>
          </div>
        </div>

        {/* Sign out */}
        <div style={{ padding: '0 10px 14px' }}>
          <button onClick={() => signOut()} style={{
            width: '100%', padding: '9px 12px',
            background: 'transparent', border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: 10, color: '#9CA3AF', fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.18s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
