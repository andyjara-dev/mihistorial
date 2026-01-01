import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ExamDetailClient from './ExamDetailClient'

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { id } = await params

  return <ExamDetailClient examId={id} />
}
