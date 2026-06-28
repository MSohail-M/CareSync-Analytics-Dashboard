'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const PERIODS = [
  { value: 'all',   label: 'All Time' },
  { value: 'month', label: 'This Month' },
  { value: 'week',  label: 'This Week' },
  { value: 'today', label: 'Today' },
]

const TYPES = [
  { value: 'all',         label: 'All Calls' },
  { value: 'ai_handled',  label: 'AI Handled' },
  { value: 'transferred', label: 'Transferred to Front Desk' },
]

export function CallsFilterBar({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const period = searchParams.get('period') ?? 'all'
  const type   = searchParams.get('type')   ?? 'all'

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const chipBase: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 500,
    cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)',
    background: 'white', color: '#6B7280', transition: 'all .18s',
  }
  const chipActive: React.CSSProperties = {
    ...chipBase, background: '#1B4F8C', color: 'white',
    border: '1px solid #1B4F8C', fontWeight: 600,
    boxShadow: '0 2px 8px rgba(27,79,140,0.25)',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</span>
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => update('period', p.value)} style={period === p.value ? chipActive : chipBase}>{p.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</span>
        {TYPES.map(t => (
          <button key={t.value} onClick={() => update('type', t.value)} style={type === t.value ? chipActive : chipBase}>
            {t.value === 'transferred' ? '↪ ' + t.label : t.value === 'ai_handled' ? '🤖 ' + t.label : t.label}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 100, padding: '5px 14px', fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
        {total} calls
      </div>
    </div>
  )
}
