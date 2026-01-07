import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData } from '@/lib/encryption'

/**
 * Reintentar el procesamiento de un examen con IA
 * POST /api/exams/[id]/retry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener usuario con clave de encriptación
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el examen y verificar que pertenece al usuario
    const exam = await prisma.medicalExam.findUnique({
      where: { id },
      include: {
        document: true,
      },
    })

    if (!exam || exam.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Examen no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el examen esté en estado fallido o procesando
    if (exam.processingStatus !== 'failed' && exam.processingStatus !== 'processing') {
      return NextResponse.json(
        { error: 'Solo se pueden reintentar exámenes fallidos o en procesamiento' },
        { status: 400 }
      )
    }

    if (!exam.document) {
      return NextResponse.json(
        { error: 'No se encontró el documento asociado' },
        { status: 404 }
      )
    }

    // Actualizar estado a procesando
    await prisma.medicalExam.update({
      where: { id },
      data: {
        processingStatus: 'processing',
        aiProcessed: false,
      },
    })

    // Leer y desencriptar el archivo usando la función helper
    const { readEncryptedFile } = await import('@/lib/file-storage')
    const decryptedBuffer = await readEncryptedFile(
      exam.document.filePath,
      exam.document.encryptionIv,
      user.encryptionKey
    )

    // Procesar con IA en segundo plano
    try {
      const { extractTextFromPDF, processExamWithAI } = await import('@/lib/ai-processor')
      const { encryptData } = await import('@/lib/encryption')

      const pdfText = await extractTextFromPDF(decryptedBuffer)

      processExamWithAI(pdfText, exam.examType, exam.institution)
        .then(async (extractedData) => {
          // Encriptar los datos
          const { encrypted: encryptedData, iv: ivData } = encryptData(
            JSON.stringify(extractedData),
            user.encryptionKey
          )

          // Actualizar el examen en la BD
          await prisma.medicalExam.update({
            where: { id: exam.id },
            data: {
              encryptedData: encryptedData,
              encryptionIv: ivData,
              aiProcessed: true,
              processingStatus: 'completed',
            },
          })

          console.log(`✅ Reintento exitoso para examen ${exam.id}`)

          // Encolar reporte de salud con debouncing
          try {
            const { healthReportQueue } = await import('@/lib/health-report-queue')
            console.log(`🏥 Encolando generación de reporte de salud para usuario ${user.id}...`)

            // Encolar con debouncing de 30s para consolidar múltiples exámenes
            healthReportQueue.enqueueReport(user.id, user.encryptionKey, exam.id)
          } catch (error) {
            console.error('Error al encolar generación de reporte:', error)
          }
        })
        .catch(async (error) => {
          console.error('Error al procesar con IA en reintento:', error)
          // Actualizar estado a fallido
          try {
            await prisma.medicalExam.update({
              where: { id: exam.id },
              data: {
                processingStatus: 'failed',
              },
            })
            console.log(`❌ Examen ${exam.id} marcado como fallido en reintento`)
          } catch (updateError) {
            console.error('❌ Error crítico: No se pudo actualizar estado a fallido:', updateError)
          }
        })
    } catch (error) {
      console.error('Error al extraer texto del PDF en reintento:', error)
      await prisma.medicalExam.update({
        where: { id },
        data: {
          processingStatus: 'failed',
        },
      })
      throw error
    }

    return NextResponse.json({
      message: 'Procesamiento reiniciado exitosamente',
      exam: {
        id: exam.id,
        processingStatus: 'processing',
      },
    })
  } catch (error) {
    console.error('Error al reintentar procesamiento:', error)
    return NextResponse.json(
      { error: 'Error al reintentar procesamiento' },
      { status: 500 }
    )
  }
}
