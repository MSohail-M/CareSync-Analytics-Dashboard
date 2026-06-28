import { redirect } from 'next/navigation'
import { getClinic } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinic()

  // Not logged in or no clinic linked — send to login
  if (!clinic) redirect('/login')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F3EE' }}>
      <Sidebar clinic={clinic} />
      <main className="dashboard-main" style={{ flex: 1, overflow: 'auto', background: '#F4F3EE' }}>
        {children}
      </main>
    </div>
  )
}
