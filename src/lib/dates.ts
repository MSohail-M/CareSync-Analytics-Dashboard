// Clinic-local time formatting. Server components render on Vercel (UTC),
// so the timezone must be explicit — never inherited from the server clock.
export const CLINIC_TZ = 'America/New_York'

export function fmtDateET(d: Date): string {
  return d.toLocaleDateString('en-US', { timeZone: CLINIC_TZ, month: 'long', day: 'numeric', year: 'numeric' })
}

export function fmtTimeET(d: Date): string {
  return d.toLocaleTimeString('en-US', { timeZone: CLINIC_TZ, hour: 'numeric', minute: '2-digit' })
}

export function fmtDateTimeET(iso: string): string {
  const d = new Date(iso)
  return `${fmtDateET(d)} · ${fmtTimeET(d)} ET`
}
