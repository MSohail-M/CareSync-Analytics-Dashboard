'use client'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createClinicAction } from './actions'

const INPUT: React.CSSProperties = {
  width: '100%', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10,
  padding: '10px 13px', fontSize: 13.5, color: '#111827',
  background: '#FAFAF8', outline: 'none', boxSizing: 'border-box',
}
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 600,
  color: '#374151', marginBottom: 6, letterSpacing: '0.02em',
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} style={{
      background: pending ? '#93C5FD' : 'linear-gradient(135deg,#1B4F8C,#2563EB)',
      color: 'white', border: 'none', borderRadius: 12,
      padding: '11px 28px', fontSize: 13.5, fontWeight: 700,
      cursor: pending ? 'not-allowed' : 'pointer',
      boxShadow: pending ? 'none' : '0 4px 14px rgba(27,79,140,0.3)',
    }}>
      {pending ? 'Creating…' : 'Create Clinic & Send Invite'}
    </button>
  )
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function NewClinicForm() {
  const [open, setOpen]         = useState(false)
  const [name, setName]         = useState('')
  const [slug, setSlug]         = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [state, action] = useFormState(createClinicAction, null)

  function handleName(v: string) {
    setName(v)
    if (!slugEdited) setSlug(slugify(v))
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: open ? 'rgba(27,79,140,0.07)' : 'linear-gradient(135deg,#1B4F8C,#2563EB)',
          color: open ? '#1B4F8C' : 'white',
          border: open ? '1.5px solid rgba(27,79,140,0.2)' : 'none',
          borderRadius: 12, padding: '11px 22px', fontSize: 13.5, fontWeight: 700,
          cursor: 'pointer', boxShadow: open ? 'none' : '0 4px 14px rgba(27,79,140,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {open ? '✕ Cancel' : '+ New Clinic'}
      </button>

      {open && (
        <div style={{
          marginTop: 16, background: 'white', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 18, padding: '28px 28px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          animation: 'fadeSlideUp 0.3s cubic-bezier(0.32,0.72,0,1) both',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 22, letterSpacing: '-0.01em' }}>
            Onboard New Clinic
          </h3>

          <form action={action}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

              {/* Clinic name */}
              <div>
                <label style={LABEL}>Clinic Name *</label>
                <input name="name" required value={name} onChange={e => handleName(e.target.value)}
                  placeholder="Primary Coastal Care" style={INPUT} />
              </div>

              {/* Slug */}
              <div>
                <label style={LABEL}>Slug * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(URL-safe, unique)</span></label>
                <input name="slug" required value={slug}
                  onChange={e => { setSlugEdited(true); setSlug(e.target.value) }}
                  placeholder="primary-coastal-care" style={INPUT} />
              </div>

              {/* Phone */}
              <div>
                <label style={LABEL}>Clinic Phone</label>
                <input name="phone" type="tel" placeholder="+14105550199" style={INPUT} />
              </div>

              {/* Plan */}
              <div>
                <label style={LABEL}>Plan Tier</label>
                <select name="plan" defaultValue="growth" style={{ ...INPUT, cursor: 'pointer' }}>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Retell Agent ID */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Retell Agent ID <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional — can add later)</span></label>
                <input name="agent_id" placeholder="agent_xxxxxxxxxxxxxxxxxx" style={INPUT} />
              </div>

              {/* Divider */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 18, marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
                  Admin Contact (receives invite email)
                </p>
              </div>

              {/* Contact name */}
              <div>
                <label style={LABEL}>Contact Name *</label>
                <input name="contact_name" required placeholder="Dr. Jane Smith" style={INPUT} />
              </div>

              {/* Contact email */}
              <div>
                <label style={LABEL}>Contact Email *</label>
                <input name="contact_email" required type="email" placeholder="jane@clinic.com" style={INPUT} />
              </div>

              {/* Role */}
              <div>
                <label style={LABEL}>Dashboard Role</label>
                <select name="role" defaultValue="owner" style={{ ...INPUT, cursor: 'pointer' }}>
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

            </div>

            {/* Feedback */}
            {state?.error && (
              <div style={{ marginTop: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
                {state.error}
              </div>
            )}
            {state?.success && (
              <div style={{ marginTop: 16, background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600 }}>
                {state.success}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <SubmitButton />
              <button type="button" onClick={() => setOpen(false)} style={{
                background: 'transparent', border: '1.5px solid rgba(0,0,0,0.1)',
                borderRadius: 12, padding: '11px 20px', fontSize: 13.5,
                color: '#6B7280', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
