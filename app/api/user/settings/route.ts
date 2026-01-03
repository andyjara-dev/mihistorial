import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { healthReportPeriodMonths } = body

    // Validar período
    const validPeriods = [1, 3, 6, 12, 24]
    if (healthReportPeriodMonths && !validPeriods.includes(healthReportPeriodMonths)) {
      return NextResponse.json(
        { error: 'Período inválido. Debe ser 1, 3, 6, 12 o 24 meses' },
        { status: 400 }
      )
    }

    // Actualizar configuración del usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        healthReportPeriodMonths,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        healthReportPeriodMonths: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener configuración del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        healthReportPeriodMonths: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
