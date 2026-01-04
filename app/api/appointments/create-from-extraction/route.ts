import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptData } from '@/lib/encryption'

/**
 * POST /api/appointments/create-from-extraction
 * Crea una cita desde datos extraídos por IA (ya revisados/editados por el usuario)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener usuario con clave de encriptación
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Parsear body
    const body = await request.json()
    const {
      doctorName,
      specialty,
      appointmentDate,
      location,
      notes,
      originalEmail,
      sendReminders = true,
    } = body

    // Validar campos requeridos
    if (!doctorName || !specialty || !appointmentDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: doctorName, specialty, appointmentDate' },
        { status: 400 }
      )
    }

    // Validar fecha
    const parsedDate = new Date(appointmentDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Fecha inválida' },
        { status: 400 }
      )
    }

    // Encriptar notas si existen
    let encryptedNotes: string | null = null
    let encryptionIv: string | null = null

    if (notes && notes.trim()) {
      const encrypted = encryptData(notes, user.encryptionKey)
      encryptedNotes = encrypted.encrypted
      encryptionIv = encrypted.iv
    }

    // Encriptar email original si existe
    let encryptedEmailData: string | null = null
    let emailEncryptionIv: string | null = null

    if (originalEmail && originalEmail.trim()) {
      const encrypted = encryptData(originalEmail, user.encryptionKey)
      encryptedEmailData = encrypted.encrypted
      emailEncryptionIv = encrypted.iv
    }

    // Crear cita
    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        doctorName: doctorName.trim(),
        specialty: specialty.trim(),
        appointmentDate: parsedDate,
        location: location?.trim() || null,
        encryptedNotes,
        encryptionIv,
        encryptedEmailData,
        emailEncryptionIv,
        sourceType: 'ai_assisted', // Marcar como asistida por IA
        status: 'scheduled',
        sendReminders,
      },
    })

    return NextResponse.json(
      {
        message: 'Cita creada exitosamente con asistencia de IA',
        appointment: {
          id: appointment.id,
          doctorName: appointment.doctorName,
          specialty: appointment.specialty,
          appointmentDate: appointment.appointmentDate,
          location: appointment.location,
          status: appointment.status,
          sourceType: appointment.sourceType,
          sendReminders: appointment.sendReminders,
          notes,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear cita desde extracción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
