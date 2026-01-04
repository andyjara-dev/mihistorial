import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/appointments/[id]/status
 * Actualiza solo el estado de una cita
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

    // Parsear body
    const body = await request.json()
    const { status } = body

    // Validar estado
    const validStatuses = ['scheduled', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Actualizar solo el estado
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    return NextResponse.json({
      message: 'Estado de cita actualizado exitosamente',
      appointment: {
        id: updatedAppointment.id,
        doctorName: updatedAppointment.doctorName,
        specialty: updatedAppointment.specialty,
        appointmentDate: updatedAppointment.appointmentDate,
        status: updatedAppointment.status,
      },
    })
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
