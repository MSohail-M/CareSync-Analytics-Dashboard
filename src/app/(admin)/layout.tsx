import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'dev') redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3EE' }}>
      {children}
    </div>
  )
}
