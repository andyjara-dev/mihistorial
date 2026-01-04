import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData, encryptData } from '@/lib/encryption'

/**
 * GET /api/appointments/[id]
 * Obtiene el detalle completo de una cita
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: appointmentId } = await params

    // Obtener la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Verificar que la cita pertenece al usuario
    if (appointment.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener la clave de encriptación del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Desencriptar notas si existen
    let notes = null
    if (appointment.encryptedNotes && appointment.encryptionIv) {
      try {
        notes = decryptData(
          appointment.encryptedNotes,
          appointment.encryptionIv,
          user.encryptionKey
        )
      } catch (error) {
        console.error('Error al desencriptar notas:', error)
      }
    }

    // Desencriptar email original si existe
    let originalEmail = null
    if (appointment.encryptedEmailData && appointment.emailEncryptionIv) {
      try {
        originalEmail = decryptData(
          appointment.encryptedEmailData,
          appointment.emailEncryptionIv,
          user.encryptionKey
        )
      } catch (error) {
        console.error('Error al desencriptar email original:', error)
      }
    }

    return NextResponse.json({
      id: appointment.id,
      doctorName: appointment.doctorName,
      specialty: appointment.specialty,
      appointmentDate: appointment.appointmentDate,
      location: appointment.location,
      status: appointment.status,
      sourceType: appointment.sourceType,
      sendReminders: appointment.sendReminders,
      reminder1Sent: appointment.reminder1Sent,
      reminder1SentAt: appointment.reminder1SentAt,
      reminder2Sent: appointment.reminder2Sent,
      reminder2SentAt: appointment.reminder2SentAt,
      notes,
      originalEmail,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    })
  } catch (error) {
    console.error('Error al obtener cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/appointments/[id]
 * Actualiza una cita existente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: appointmentId } = await params

    // Obtener la cita actual
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Verificar que la cita pertenece al usuario
    if (appointment.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
      sendReminders,
    } = body

    // Preparar datos para actualización
    const updateData: {
      doctorName?: string
      specialty?: string
      appointmentDate?: Date
      location?: string | null
      encryptedNotes?: string | null
      encryptionIv?: string | null
      sendReminders?: boolean
      reminder1Sent?: boolean
      reminder2Sent?: boolean
      reminder1SentAt?: null
      reminder2SentAt?: null
    } = {}

    if (doctorName !== undefined) {
      updateData.doctorName = doctorName.trim()
    }

    if (specialty !== undefined) {
      updateData.specialty = specialty.trim()
    }

    if (appointmentDate !== undefined) {
      const parsedDate = new Date(appointmentDate)
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
      }

      updateData.appointmentDate = parsedDate

      // Si la fecha cambia, resetear los recordatorios
      if (parsedDate.getTime() !== appointment.appointmentDate.getTime()) {
        updateData.reminder1Sent = false
        updateData.reminder2Sent = false
        updateData.reminder1SentAt = null
        updateData.reminder2SentAt = null
      }
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null
    }

    // Encriptar notas si cambiaron
    if (notes !== undefined) {
      if (notes && notes.trim()) {
        const encrypted = encryptData(notes, user.encryptionKey)
        updateData.encryptedNotes = encrypted.encrypted
        updateData.encryptionIv = encrypted.iv
      } else {
        updateData.encryptedNotes = null
        updateData.encryptionIv = null
      }
    }

    if (sendReminders !== undefined) {
      updateData.sendReminders = sendReminders
    }

    // Actualizar cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    })

    // Desencriptar notas para respuesta
    let decryptedNotes = null
    if (updatedAppointment.encryptedNotes && updatedAppointment.encryptionIv) {
      try {
        decryptedNotes = decryptData(
          updatedAppointment.encryptedNotes,
          updatedAppointment.encryptionIv,
          user.encryptionKey
        )
      } catch (error) {
        console.error('Error al desencriptar notas:', error)
      }
    }

    return NextResponse.json({
      message: 'Cita actualizada exitosamente',
      appointment: {
        id: updatedAppointment.id,
        doctorName: updatedAppointment.doctorName,
        specialty: updatedAppointment.specialty,
        appointmentDate: updatedAppointment.appointmentDate,
        location: updatedAppointment.location,
        status: updatedAppointment.status,
        sourceType: updatedAppointment.sourceType,
        sendReminders: updatedAppointment.sendReminders,
        notes: decryptedNotes,
      },
    })
  } catch (error) {
    console.error('Error al actualizar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/appointments/[id]
 * Elimina una cita (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: appointmentId } = await params

    // Obtener la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Verificar que la cita pertenece al usuario
    if (appointment.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Eliminar cita
    await prisma.appointment.delete({
      where: { id: appointmentId },
    })

    return NextResponse.json({
      message: 'Cita eliminada exitosamente',
      deletedId: appointmentId,
    })
  } catch (error) {
    console.error('Error al eliminar cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
