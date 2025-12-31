import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Obtener exámenes del usuario
  const medicalExams = await prisma.medicalExam.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      examDate: 'desc',
    },
    include: {
      document: true,
    },
  })

  // Obtener citas médicas
  const appointments = await prisma.appointment.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      appointmentDate: 'desc',
    },
  })

  return (
    <DashboardClient
      user={session.user}
      medicalExams={medicalExams}
      appointments={appointments}
    />
  )
}
