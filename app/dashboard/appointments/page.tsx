import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAppointmentMetadata } from '@/lib/metadata-helpers'
import AppointmentsClient from './AppointmentsClient'

export default async function AppointmentsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Obtener usuario con clave de encriptación
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Obtener todas las citas del usuario
  const appointmentsRaw = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { appointmentDate: 'desc' },
  })

  // Desencriptar metadatos de cada cita
  const appointments = appointmentsRaw.map(appointment => {
    const metadata = getAppointmentMetadata(appointment, user.encryptionKey)
    return {
      ...appointment,
      doctorName: metadata.doctorName,
      location: metadata.location || null,
      institution: metadata.institution || null,
    }
  })

  return <AppointmentsClient appointments={appointments} />
}
