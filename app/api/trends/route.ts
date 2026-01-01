import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData } from '@/lib/encryption'
import { groupMeasurements } from '@/lib/measurement-normalizer'

/**
 * Endpoint para obtener tendencias de mediciones a través del tiempo
 * GET /api/trends
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener la clave de encriptación del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener todos los exámenes del usuario que estén procesados
    const exams = await prisma.medicalExam.findMany({
      where: {
        userId: session.user.id,
        aiProcessed: true,
        processingStatus: 'completed',
      },
      orderBy: {
        examDate: 'asc',
      },
      select: {
        id: true,
        examType: true,
        examDate: true,
        encryptedData: true,
        encryptionIv: true,
      },
    })

    if (exams.length === 0) {
      return NextResponse.json({
        measurements: [],
        totalExams: 0,
        message: 'No hay exámenes procesados aún',
      })
    }

    // Desencriptar y preparar los datos
    const decryptedExams = exams.map(exam => {
      const decrypted = decryptData(
        exam.encryptedData,
        exam.encryptionIv,
        user.encryptionKey
      )

      let data
      try {
        data = JSON.parse(decrypted)
      } catch (error) {
        console.error('Error al parsear datos:', error)
        data = {}
      }

      return {
        id: exam.id,
        examType: exam.examType,
        examDate: exam.examDate,
        data,
      }
    })

    // Agrupar y normalizar mediciones
    const measurements = groupMeasurements(decryptedExams)

    // Calcular estadísticas
    const stats = measurements.map(measurement => {
      const values = measurement.values.map(v => v.value)
      const latest = measurement.values[measurement.values.length - 1]
      const previous = measurement.values.length > 1
        ? measurement.values[measurement.values.length - 2]
        : null

      // Calcular tendencia
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercentage = 0

      if (previous) {
        const change = latest.value - previous.value
        trendPercentage = (change / previous.value) * 100

        if (Math.abs(trendPercentage) > 5) {
          trend = change > 0 ? 'up' : 'down'
        }
      }

      // Verificar si hay conversiones de unidades
      const hasConversions = measurement.values.some(
        v => v.originalUnit && v.unit && v.originalUnit !== v.unit
      )

      return {
        name: measurement.name,
        category: measurement.category,
        count: measurement.values.length,
        latestValue: latest.value,
        latestRawValue: latest.rawValue,
        latestUnit: latest.unit,
        latestDate: latest.date,
        latestIsAbnormal: latest.isAbnormal,
        trend,
        trendPercentage,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        hasConversions,
        values: measurement.values.map(v => ({
          value: v.value,
          rawValue: v.rawValue,
          unit: v.unit,
          originalValue: v.originalValue,
          originalUnit: v.originalUnit,
          date: v.date,
          examId: v.examId,
          examType: v.examType,
          isAbnormal: v.isAbnormal,
          normalRange: v.normalRange,
        })),
      }
    })

    // Agrupar por categoría
    const byCategory = stats.reduce((acc, measurement) => {
      if (!acc[measurement.category]) {
        acc[measurement.category] = []
      }
      acc[measurement.category].push(measurement)
      return acc
    }, {} as Record<string, typeof stats>)

    return NextResponse.json({
      measurements: stats,
      byCategory,
      totalExams: exams.length,
      totalMeasurements: measurements.length,
    })
  } catch (error) {
    console.error('Error al obtener tendencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener tendencias' },
      { status: 500 }
    )
  }
}
