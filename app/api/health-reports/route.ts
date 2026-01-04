import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData } from '@/lib/encryption'

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

    // Obtener todos los reportes ACTIVOS del usuario (no eliminados)
    const reports = await prisma.healthReport.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,  // Solo reportes activos
      },
      orderBy: {
        generatedAt: 'desc',
      },
    })

    // Desencriptar datos de cada reporte
    const decryptedReports = reports.map(report => {
      try {
        const decryptedData = decryptData(
          report.encryptedData,
          report.encryptionIv,
          user.encryptionKey
        )
        const data = JSON.parse(decryptedData)

        return {
          id: report.id,
          periodMonths: report.periodMonths,
          periodStart: report.periodStart,
          periodEnd: report.periodEnd,
          generatedAt: report.generatedAt,
          emailSent: report.emailSent,
          // Solo incluir datos resumidos para la lista
          summary: data.summary,
          overallStatus: data.overallStatus,
          keyFindings: data.keyFindings?.slice(0, 3), // Solo primeros 3
          examCount: data.examCount,
        }
      } catch (error) {
        console.error(`Error al desencriptar reporte ${report.id}:`, error)
        return {
          id: report.id,
          periodMonths: report.periodMonths,
          periodStart: report.periodStart,
          periodEnd: report.periodEnd,
          generatedAt: report.generatedAt,
          emailSent: report.emailSent,
          error: 'No se pudo desencriptar',
        }
      }
    })

    return NextResponse.json({
      reports: decryptedReports,
      total: reports.length,
    })
  } catch (error) {
    console.error('Error al obtener reportes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
