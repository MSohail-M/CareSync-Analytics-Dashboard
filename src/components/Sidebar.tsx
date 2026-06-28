'use client'
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
]

export default function Sidebar({ clinic }: { clinic: Clinic }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 228,
      background: 'white',
      borderRight: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      boxShadow: '1px 0 0 rgba(0,0,0,0.04)',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Image src="/caresync-logo.png" alt="CareSync" width={120} height={42} style={{ objectFit: 'contain', display: 'block' }} />
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
            <Link key={item.href} href={item.href} style={{
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: clinic.retell_agent_id ? 'rgba(5,150,105,0.07)' : 'rgba(217,119,6,0.07)',
          border: `1px solid ${clinic.retell_agent_id ? 'rgba(5,150,105,0.18)' : 'rgba(217,119,6,0.18)'}`,
          borderRadius: 9, padding: '8px 12px',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: clinic.retell_agent_id ? '#059669' : '#D97706',
            boxShadow: `0 0 6px ${clinic.retell_agent_id ? '#059669' : '#D97706'}`,
            animation: 'statusPulse 2.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: clinic.retell_agent_id ? '#059669' : '#D97706' }}>
            {clinic.retell_agent_id ? 'AI Agent Live' : 'Setup Pending'}
          </span>
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
  )
}
