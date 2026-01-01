import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TrendsClient from './TrendsClient'

export default async function TrendsPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return <TrendsClient />
}
