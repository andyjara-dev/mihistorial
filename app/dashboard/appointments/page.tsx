import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AppointmentsClient from './AppointmentsClient'

export default async function AppointmentsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Obtener todas las citas del usuario
  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { appointmentDate: 'desc' },
  })

  return <AppointmentsClient appointments={appointments} />
}
