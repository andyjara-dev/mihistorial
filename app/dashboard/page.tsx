import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getExamMetadata, getAppointmentMetadata, getDocumentMetadata } from '@/lib/metadata-helpers'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
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

  // Obtener exámenes del usuario
  const medicalExamsRaw = await prisma.medicalExam.findMany({
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

  // Desencriptar metadatos de exámenes
  const medicalExams = medicalExamsRaw.map(exam => {
    const examMetadata = getExamMetadata(exam, user.encryptionKey)
    const docMetadata = exam.document ? getDocumentMetadata(exam.document, user.encryptionKey) : null

    return {
      ...exam,
      examType: examMetadata.examType,
      institution: examMetadata.institution || null,
      laboratory: examMetadata.laboratory || null,
      document: exam.document ? {
        ...exam.document,
        fileName: docMetadata?.fileName || exam.document.fileName,
        documentType: docMetadata?.documentType || null,
      } : null,
    }
  })

  // Obtener citas médicas
  const appointmentsRaw = await prisma.appointment.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      appointmentDate: 'desc',
    },
  })

  // Desencriptar metadatos de citas
  const appointments = appointmentsRaw.map(appointment => {
    const metadata = getAppointmentMetadata(appointment, user.encryptionKey)
    return {
      ...appointment,
      doctorName: metadata.doctorName,
      location: metadata.location || null,
      institution: metadata.institution || null,
    }
  })

  return (
    <DashboardClient
      user={session.user}
      medicalExams={medicalExams}
      appointments={appointments}
    />
  )
}
