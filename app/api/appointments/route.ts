import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData, encryptData } from '@/lib/encryption'
import { getAppointmentMetadata, encryptAppointmentMetadata } from '@/lib/metadata-helpers'

/**
 * GET /api/appointments
 * Lista todas las citas del usuario autenticado
 * Query params opcionales: ?status=scheduled|completed|cancelled
 */
export async function GET(request: NextRequest) {
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

    // Obtener filtro de status de query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    // Construir where clause
    const whereClause: {
      userId: string
      status?: string
    } = {
      userId: session.user.id,
    }

    if (statusFilter && ['scheduled', 'completed', 'cancelled'].includes(statusFilter)) {
      whereClause.status = statusFilter
    }

    // Obtener citas
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        appointmentDate: 'desc',
      },
    })

    // Desencriptar notas y metadatos si existen
    const decryptedAppointments = appointments.map(appointment => {
      let notes = null

      if (appointment.encryptedNotes && appointment.encryptionIv) {
        try {
          notes = decryptData(
            appointment.encryptedNotes,
            appointment.encryptionIv,
            user.encryptionKey
          )
        } catch (error) {
          console.error(`Error al desencriptar notas de cita ${appointment.id}:`, error)
        }
      }

      // Desencriptar metadatos
      const metadata = getAppointmentMetadata(appointment, user.encryptionKey)

      return {
        id: appointment.id,
        doctorName: metadata.doctorName,
        specialty: appointment.specialty,
        appointmentDate: appointment.appointmentDate,
        location: metadata.location,
        institution: metadata.institution,
        status: appointment.status,
        sourceType: appointment.sourceType,
        sendReminders: appointment.sendReminders,
        reminder1Sent: appointment.reminder1Sent,
        reminder2Sent: appointment.reminder2Sent,
        notes,
        createdAt: appointment.createdAt,
      }
    })

    return NextResponse.json({
      appointments: decryptedAppointments,
      total: decryptedAppointments.length,
    })
  } catch (error) {
    console.error('Error al obtener citas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointments
 * Crea una nueva cita médica (entrada manual)
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

    // Encriptar metadatos
    const metadata = encryptAppointmentMetadata(
      {
        doctorName: doctorName.trim(),
        location: location?.trim(),
      },
      user.encryptionKey
    )

    // Crear cita
    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        doctorName: doctorName.trim(), // Campo legacy
        specialty: specialty.trim(),
        appointmentDate: parsedDate,
        location: location?.trim() || null, // Campo legacy
        encryptedMetadata: metadata.encryptedMetadata,
        metadataIv: metadata.metadataIv,
        encryptedNotes,
        encryptionIv,
        sourceType: 'manual',
        status: 'scheduled',
        sendReminders,
      },
    })

    // Desencriptar metadatos para respuesta
    const responseMetadata = getAppointmentMetadata(appointment, user.encryptionKey)

    return NextResponse.json(
      {
        message: 'Cita creada exitosamente',
        appointment: {
          id: appointment.id,
          doctorName: responseMetadata.doctorName,
          specialty: appointment.specialty,
          appointmentDate: appointment.appointmentDate,
          location: responseMetadata.location,
          status: appointment.status,
          sourceType: appointment.sourceType,
          sendReminders: appointment.sendReminders,
          notes,
          createdAt: appointment.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
