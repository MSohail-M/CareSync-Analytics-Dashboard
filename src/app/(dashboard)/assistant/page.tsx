import { redirect } from 'next/navigation'
import { getClinic } from '@/lib/supabase'
import { AssistantChat } from '@/components/AssistantChat'

export default async function AssistantPage() {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  return (
    <div style={{ padding: '28px 28px 0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* Header */}
      <div style={{ marginBottom: 20, flexShrink: 0, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, rgba(27,79,140,0.1), rgba(13,148,136,0.08))', border: '1px solid rgba(27,79,140,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4F8C' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>AI Assistant</h1>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(27,79,140,0.08)', color: '#1B4F8C', border: '1px solid rgba(27,79,140,0.16)' }}>
            Phase 1 · Read-only
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
          Chat with your call data — ask about outcomes, transcripts, transfer reasons, and daily stats
        </p>
      </div>

      {/* Chat panel */}
      <div style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 16px',
        animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.06s both',
        overflow: 'hidden',
      }}>
        <AssistantChat />
      </div>
    </div>
  )
}
