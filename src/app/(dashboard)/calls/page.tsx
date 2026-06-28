import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getClinic, getCalls } from '@/lib/supabase'
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { CallsFilterBar } from '@/components/CallsFilterBar'
import { CallsTable } from '@/components/CallsTable'
import type { Call } from '@/lib/supabase'

function filterCalls(calls: Call[], period: string, type: string): Call[] {
  const now = new Date()
  let result = calls
  if (period === 'today') result = result.filter(c => c.started_at && new Date(c.started_at) >= startOfDay(now))
  if (period === 'week')  result = result.filter(c => c.started_at && new Date(c.started_at) >= startOfWeek(now))
  if (period === 'month') result = result.filter(c => c.started_at && new Date(c.started_at) >= startOfMonth(now))
  if (type === 'transferred') result = result.filter(c => c.outcome === 'transferred')
  if (type === 'ai_handled')  result = result.filter(c => c.outcome !== 'transferred')
  return result
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; type?: string }>
}) {
  const clinic = await getClinic()
  if (!clinic) redirect('/login')

  const { period = 'all', type = 'all' } = await searchParams
  const allCalls = await getCalls(500)
  const calls    = filterCalls(allCalls, period, type)

  return (
    <div style={{ padding: '28px 28px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: 'fadeSlideUp 0.45s cubic-bezier(0.32,0.72,0,1) both' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>Call Logs</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
          Click <strong style={{ color: '#1B4F8C' }}>View</strong> for full transcript · Click <strong style={{ color: '#1B4F8C' }}>▶</strong> to listen inline
        </p>
      </div>

      <Suspense>
        <CallsFilterBar total={calls.length} />
      </Suspense>

      <div style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: 'fadeSlideUp 0.5s cubic-bezier(0.32,0.72,0,1) 0.08s both',
      }}>
        <CallsTable calls={calls} />
      </div>
    </div>
  )
}
