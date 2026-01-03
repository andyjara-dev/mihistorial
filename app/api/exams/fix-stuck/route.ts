import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Arregla exámenes atascados en estado "processing" que fallaron
 * GET /api/exams/fix-stuck
 */
export async function GET() {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Buscar exámenes del usuario que:
    // 1. Están en estado "processing"
    // 2. NO han sido procesados con IA (aiProcessed = false)
    // 3. Fueron creados hace más de 5 minutos (para no afectar procesamientos activos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const stuckExams = await prisma.medicalExam.findMany({
      where: {
        userId: session.user.id,
        processingStatus: 'processing',
        aiProcessed: false,
        createdAt: {
          lt: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        examType: true,
        examDate: true,
        createdAt: true,
      },
    })

    if (stuckExams.length === 0) {
      return NextResponse.json({
        message: 'No se encontraron exámenes atascados',
        fixed: 0,
        exams: [],
      })
    }

    // Actualizar todos a estado "failed"
    await prisma.medicalExam.updateMany({
      where: {
        id: {
          in: stuckExams.map(e => e.id),
        },
      },
      data: {
        processingStatus: 'failed',
      },
    })

    console.log(`🔧 Se arreglaron ${stuckExams.length} exámenes atascados para usuario ${session.user.id}`)

    return NextResponse.json({
      message: `Se actualizaron ${stuckExams.length} exámenes a estado "failed"`,
      fixed: stuckExams.length,
      exams: stuckExams.map(e => ({
        id: e.id,
        examType: e.examType,
        examDate: e.examDate,
      })),
    })
  } catch (error) {
    console.error('Error al arreglar exámenes atascados:', error)
    return NextResponse.json(
      { error: 'Error al arreglar exámenes' },
      { status: 500 }
    )
  }
}
