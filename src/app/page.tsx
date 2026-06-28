import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LandingClient from '@/components/LandingClient'

export default async function Home() {
  const token = (await cookies()).get('sb-token')?.value
  if (token) redirect('/dashboard')

  return <LandingClient />
}
