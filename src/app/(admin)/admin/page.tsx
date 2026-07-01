import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { NewClinicForm } from './NewClinicForm'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const PLAN_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  starter:    { bg: 'rgba(107,114,128,0.08)', color: '#6B7280', border: 'rgba(107,114,128,0.2)' },
  growth:     { bg: 'rgba(37,99,235,0.08)',   color: '#2563EB', border: 'rgba(37,99,235,0.2)'   },
  enterprise: { bg: 'rgba(5,150,105,0.08)',   color: '#059669', border: 'rgba(5,150,105,0.2)'   },
}

const ROLE_COLOR: Record<string, string> = {
  dev: '#DC2626', owner: '#1B4F8C', manager: '#0D9488', staff: '#6B7280',
}

export default async function AdminPage() {
  const sb = adminClient()

  const [{ data: clinics }, { data: users }, { data: calls }] = await Promise.all([
    sb.from('clinics').select('*').order('created_at', { ascending: false }),
    sb.from('users').select('*'),
    sb.from('calls').select('clinic_id'),
  ])

  const callsByClinic  = (calls ?? []).reduce<Record<string, number>>((acc, c) => {
    if (c.clinic_id) acc[c.clinic_id] = (acc[c.clinic_id] ?? 0) + 1
    return acc
  }, {})

  const usersByClinic = (users ?? []).reduce<Record<string, typeof users>>((acc, u) => {
    if (!acc[u.clinic_id]) acc[u.clinic_id] = []
    acc[u.clinic_id]!.push(u)
    return acc
  }, {})

  const totalClinics = clinics?.length ?? 0
  const totalUsers   = users?.length ?? 0
  const totalCalls   = calls?.length ?? 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/caresync-logo.png" alt="CareSync" width={120} height={42} style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 32, background: 'rgba(0,0,0,0.1)' }} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Admin Panel</h1>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Clinic management & onboarding</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Clinics',  value: totalClinics, color: '#1B4F8C' },
          { label: 'Total Users',    value: totalUsers,   color: '#0D9488' },
          { label: 'Total Calls',    value: totalCalls,   color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 16, padding: '20px 22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── New Clinic Form ─────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <NewClinicForm />
      </div>

      {/* ── Clinics list ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(clinics ?? []).map(clinic => {
          const plan   = PLAN_STYLE[clinic.plan_tier] ?? PLAN_STYLE.starter
          const cUsers = usersByClinic[clinic.id] ?? []
          const cCalls = callsByClinic[clinic.id] ?? 0

          return (
            <div key={clinic.id} style={{
              background: 'white', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 18, padding: '22px 26px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {/* Clinic header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>{clinic.name}</h2>
                    <span style={{ fontSize: 10.5, fontWeight: 700, background: plan.bg, color: plan.color, border: `1px solid ${plan.border}`, borderRadius: 100, padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {clinic.plan_tier}
                    </span>
                    <span style={{ fontSize: 11, background: clinic.status === 'active' ? 'rgba(5,150,105,0.07)' : 'rgba(220,38,38,0.07)', color: clinic.status === 'active' ? '#059669' : '#DC2626', border: `1px solid ${clinic.status === 'active' ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: 100, padding: '2px 9px', fontWeight: 600 }}>
                      {clinic.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>/{clinic.slug}</span>
                    {clinic.phone_number && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{clinic.phone_number}</span>}
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Created {format(new Date(clinic.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#1B4F8C', letterSpacing: '-0.03em' }}>{cCalls}</div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 600 }}>CALLS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0D9488', letterSpacing: '-0.03em' }}>{cUsers.length}</div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 600 }}>USERS</div>
                  </div>
                </div>
              </div>

              {/* Retell agent IDs */}
              {clinic.retell_agent_id && (
                <div style={{ marginBottom: 14, padding: '8px 12px', background: '#F4F3EE', borderRadius: 10, fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                  Agent: {clinic.retell_agent_id}
                </div>
              )}

              {/* Users */}
              {cUsers.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Users</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cUsers.map((u: any) => (
                      <div key={u.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: '#F4F3EE', border: '1px solid rgba(0,0,0,0.07)',
                        borderRadius: 10, padding: '7px 12px',
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${ROLE_COLOR[u.role] ?? '#6B7280'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ROLE_COLOR[u.role] ?? '#6B7280' }}>
                          {(u.name ?? u.role).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827' }}>{u.name ?? '—'}</div>
                          <div style={{ fontSize: 10.5, color: ROLE_COLOR[u.role] ?? '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{u.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
