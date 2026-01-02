import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptData } from '@/lib/encryption'
import { saveEncryptedFile } from '@/lib/file-storage'
import crypto from 'crypto'
// Procesador unificado que selecciona automáticamente según AI_PROVIDER en .env
import { extractTextFromPDF, processExamWithAI, getProviderInfo } from '@/lib/ai-processor'

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

    // Calcular hash del archivo para detectar duplicados
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    // Buscar si ya existe un documento con el mismo hash para este usuario
    const existingDocument = await prisma.document.findFirst({
      where: {
        userId: user.id,
        fileHash,
      },
      include: {
        medicalExams: true,
      },
    })

    let document
    let isUpdate = false

    if (existingDocument) {
      // Si existe, reutilizar el documento
      document = existingDocument
      isUpdate = true
      console.log(`📄 PDF duplicado detectado (hash: ${fileHash.substring(0, 10)}...). Actualizando examen existente.`)
    } else {
      // Si no existe, guardar nuevo archivo encriptado
      const { filePath, encryptionIv, fileHash: calculatedHash } = await saveEncryptedFile(
        fileBuffer,
        user.id,
        user.encryptionKey,
        file.name
      )

      // Crear nuevo documento en la BD
      document = await prisma.document.create({
        data: {
          userId: user.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath,
          encryptionIv,
          fileHash: calculatedHash,
        },
      })
    }

    // Preparar datos básicos iniciales
    let examData: Record<string, unknown> = {
      examType,
      institution,
    }

    // Encriptar datos básicos iniciales
    const { encrypted, iv } = encryptData(
      JSON.stringify(examData),
      user.encryptionKey
    )

    let medicalExam

    if (isUpdate && existingDocument && existingDocument.medicalExams.length > 0) {
      // Actualizar el examen existente
      medicalExam = await prisma.medicalExam.update({
        where: { id: existingDocument.medicalExams[0].id },
        data: {
          examType,
          institution,
          examDate: new Date(examDate),
          encryptedData: encrypted,
          encryptionIv: iv,
          processingStatus: 'processing',
          aiProcessed: false,
        },
      })
      console.log(`♻️ Examen actualizado: ${medicalExam.id}`)
    } else {
      // Crear nuevo examen médico en la BD
      medicalExam = await prisma.medicalExam.create({
        data: {
          userId: user.id,
          examType,
          institution,
          examDate: new Date(examDate),
          documentId: document.id,
          encryptedData: encrypted,
          encryptionIv: iv,
          processingStatus: 'processing',
          aiProcessed: false,
        },
      })
      console.log(`✨ Nuevo examen creado: ${medicalExam.id}`)
    }

    // Procesar con IA en segundo plano (sin bloquear la respuesta)
    try {
      const pdfText = await extractTextFromPDF(fileBuffer)

      processExamWithAI(pdfText, examType, institution)
        .then((extractedData) => {
          // Encriptar los datos extraídos
          const { encrypted: encryptedData, iv: ivData } = encryptData(
            JSON.stringify(extractedData),
            user.encryptionKey
          )

          // Actualizar el examen en la BD
          return prisma.medicalExam.update({
            where: { id: medicalExam.id },
            data: {
              encryptedData: encryptedData,
              encryptionIv: ivData,
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

    return NextResponse.json(
      {
        message: isUpdate
          ? 'Examen actualizado exitosamente. El PDF ya existía, se reprocesará con IA.'
          : 'Examen subido exitosamente',
        isUpdate,
        exam: {
          id: medicalExam.id,
          examType: medicalExam.examType,
          institution: medicalExam.institution,
          examDate: medicalExam.examDate,
        },
      },
      { status: isUpdate ? 200 : 201 }
    )
  } catch (error) {
    console.error('Error al subir examen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
