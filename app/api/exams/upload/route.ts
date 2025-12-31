import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptData } from '@/lib/encryption'
import { saveEncryptedFile } from '@/lib/file-storage'
import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Parsear FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const examType = formData.get('examType') as string
    const institution = formData.get('institution') as string
    const examDate = formData.get('examDate') as string

    // Validaciones
    if (!file || !examType || !institution || !examDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      )
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Guardar archivo encriptado
    const { filePath, encryptionIv, fileHash } = await saveEncryptedFile(
      fileBuffer,
      user.id,
      user.encryptionKey,
      file.name
    )

    // Crear documento en la BD
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath,
        encryptionIv,
        fileHash,
      },
    })

    // Extraer texto del PDF para procesamiento
    let examData: Record<string, unknown> = {
      examType,
      institution,
    }

    let aiProcessed = false

    try {
      const pdfText = await extractTextFromPDF(fileBuffer)

      // Procesar con IA en segundo plano (sin bloquear la respuesta)
      processExamWithAI(pdfText, examType, institution)
        .then((extractedData) => {
          examData = extractedData
          aiProcessed = true

          // Encriptar los datos extraídos
          const { encrypted, iv } = encryptData(
            JSON.stringify(examData),
            user.encryptionKey
          )

          // Actualizar el examen en la BD
          return prisma.medicalExam.update({
            where: { id: medicalExam.id },
            data: {
              encryptedData: encrypted,
              encryptionIv: iv,
              aiProcessed: true,
              processingStatus: 'completed',
            },
          })
        })
        .catch((error) => {
          console.error('Error al procesar con IA:', error)
          // Actualizar estado a fallido
          return prisma.medicalExam.update({
            where: { id: medicalExam.id },
            data: {
              processingStatus: 'failed',
            },
          })
        })
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error)
    }

    // Encriptar datos básicos iniciales
    const { encrypted, iv } = encryptData(
      JSON.stringify(examData),
      user.encryptionKey
    )

    // Crear examen médico en la BD
    const medicalExam = await prisma.medicalExam.create({
      data: {
        userId: user.id,
        examType,
        institution,
        examDate: new Date(examDate),
        documentId: document.id,
        encryptedData: encrypted,
        encryptionIv: iv,
        processingStatus: 'processing',
        aiProcessed,
      },
    })

    return NextResponse.json(
      {
        message: 'Examen subido exitosamente',
        exam: {
          id: medicalExam.id,
          examType: medicalExam.examType,
          institution: medicalExam.institution,
          examDate: medicalExam.examDate,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al subir examen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
