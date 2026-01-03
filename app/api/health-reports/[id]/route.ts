import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData } from '@/lib/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: reportId } = await params

    // Obtener el reporte
    const report = await prisma.healthReport.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    // Verificar que el reporte pertenece al usuario
    if (report.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener usuario con clave de encriptación
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Desencriptar datos del reporte
    let decryptedData
    try {
      const decrypted = decryptData(
        report.encryptedData,
        report.encryptionIv,
        user.encryptionKey
      )
      decryptedData = JSON.parse(decrypted)
    } catch (error) {
      console.error(`Error al desencriptar reporte ${reportId}:`, error)
      return NextResponse.json(
        { error: 'No se pudo desencriptar el reporte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: report.id,
      userId: report.userId,
      periodMonths: report.periodMonths,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      generatedAt: report.generatedAt,
      emailSent: report.emailSent,
      emailSentAt: report.emailSentAt,
      triggeredBy: report.triggeredBy,
      // Datos completos desencriptados
      data: decryptedData,
    })
  } catch (error) {
    console.error('Error al obtener reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
