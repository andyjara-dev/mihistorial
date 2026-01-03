import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import HealthReportClient from './HealthReportClient'

export default async function HealthReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { id } = await params

  return <HealthReportClient reportId={id} />
}
