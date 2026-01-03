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

    // Leer el archivo del disco
    const fs = await import('fs').then(m => m.promises)
    const fileBuffer = await fs.readFile(exam.document.filePath)

    // Desencriptar el archivo
    const crypto = await import('crypto')
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(user.encryptionKey, 'hex'),
      Buffer.from(exam.document.encryptionIv, 'hex')
    )

    // Extraer tag del archivo encriptado (últimos 16 bytes)
    const encryptedData = fileBuffer.slice(0, -16)
    const authTag = fileBuffer.slice(-16)
    decipher.setAuthTag(authTag)

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ])

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

          // Generar reporte de salud automáticamente
          try {
            const { generateHealthReport } = await import('@/lib/health-report-generator')
            console.log(`🏥 Disparando generación de reporte de salud para usuario ${user.id}...`)

            generateHealthReport(user.id, user.encryptionKey, exam.id)
              .then(reportId => {
                if (reportId) {
                  console.log(`✅ Reporte de salud generado: ${reportId}`)
                }
              })
              .catch(err => {
                console.error('❌ Error al generar reporte de salud:', err)
              })
          } catch (error) {
            console.error('Error al disparar generación de reporte:', error)
          }
        })
        .catch((error) => {
          console.error('Error al procesar con IA en reintento:', error)
          // Actualizar estado a fallido
          return prisma.medicalExam.update({
            where: { id: exam.id },
            data: {
              processingStatus: 'failed',
            },
          })
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
