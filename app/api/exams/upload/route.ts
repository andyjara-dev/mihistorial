import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptData } from '@/lib/encryption'
import { saveEncryptedFile } from '@/lib/file-storage'
import crypto from 'crypto'
// Procesador unificado que selecciona automáticamente según AI_PROVIDER en .env
import { extractTextFromPDF, processExamWithAI, getProviderInfo } from '@/lib/ai-processor'

/**
 * Hace merge inteligente de datos de examen:
 * - Mantiene todos los datos viejos
 * - Agrega solo los datos nuevos que no existían
 * - Para arrays de resultados, hace merge por nombre del test
 */
function mergeExamData(oldData: any, newData: any): any {
  const merged = { ...oldData }

  // Merge de campos de nivel superior
  for (const key in newData) {
    if (key === 'results' || key === 'measurements') {
      // Para arrays de resultados, hacer merge especial
      merged[key] = mergeResults(oldData[key] || [], newData[key] || [])
    } else if (!(key in oldData)) {
      // Si el campo no existe en datos viejos, agregarlo
      merged[key] = newData[key]
    }
    // Si ya existe en oldData, NO sobrescribir (mantener el viejo)
  }

  return merged
}

/**
 * Hace merge de arrays de resultados médicos
 * Identifica resultados por el nombre del test
 */
function mergeResults(oldResults: any[], newResults: any[]): any[] {
  const merged = [...oldResults]
  const existingTests = new Set(
    oldResults.map(r => normalizeTestName(r.test || r.name || r.measurement || ''))
  )

  // Agregar solo los resultados nuevos que no existen
  for (const newResult of newResults) {
    const testName = normalizeTestName(newResult.test || newResult.name || newResult.measurement || '')

    if (!existingTests.has(testName)) {
      merged.push(newResult)
      console.log(`  ➕ Agregando nuevo resultado: ${testName}`)
    } else {
      console.log(`  ⏭️  Manteniendo resultado existente: ${testName}`)
    }
  }

  return merged
}

/**
 * Normaliza nombres de tests para comparación
 */
function normalizeTestName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '') // Solo letras y números
    .trim()
}

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
        .then(async (extractedData) => {
          let finalData = extractedData

          // Si es una actualización (PDF duplicado), hacer MERGE inteligente
          if (isUpdate && medicalExam.aiProcessed && medicalExam.encryptedData) {
            try {
              // Obtener datos viejos desencriptados
              const { decryptData } = await import('@/lib/encryption')
              const oldDataJson = decryptData(
                medicalExam.encryptedData,
                medicalExam.encryptionIv,
                user.encryptionKey
              )
              const oldData = JSON.parse(oldDataJson)

              // Hacer merge inteligente
              finalData = mergeExamData(oldData, extractedData)

              console.log(`🔄 Merge completado: ${Object.keys(oldData).length} datos viejos + ${Object.keys(extractedData).length} datos nuevos → ${Object.keys(finalData).length} datos finales`)
            } catch (mergeError) {
              console.error('Error al hacer merge, usando datos nuevos:', mergeError)
              // Si falla el merge, usar datos nuevos
              finalData = extractedData
            }
          }

          // Encriptar los datos finales (mergeados o nuevos)
          const { encrypted: encryptedData, iv: ivData } = encryptData(
            JSON.stringify(finalData),
            user.encryptionKey
          )

          // Actualizar el examen en la BD
          await prisma.medicalExam.update({
            where: { id: medicalExam.id },
            data: {
              encryptedData: encryptedData,
              encryptionIv: ivData,
              aiProcessed: true,
              processingStatus: 'completed',
            },
          })

          // NUEVO: Encolar reporte de salud con debouncing
          try {
            const { healthReportQueue } = await import('@/lib/health-report-queue')
            console.log(`🏥 Encolando generación de reporte de salud para usuario ${user.id}...`)

            // Encolar con debouncing de 30s para consolidar múltiples exámenes
            healthReportQueue.enqueueReport(user.id, user.encryptionKey, medicalExam.id)
          } catch (error) {
            console.error('Error al encolar generación de reporte:', error)
            // No fallar el procesamiento del examen si falla el reporte
          }
        })
        .catch(async (error) => {
          console.error('Error al procesar con IA:', error)
          // Actualizar estado a fallido
          try {
            await prisma.medicalExam.update({
              where: { id: medicalExam.id },
              data: {
                processingStatus: 'failed',
              },
            })
            console.log(`❌ Examen ${medicalExam.id} marcado como fallido`)
          } catch (updateError) {
            console.error('❌ Error crítico: No se pudo actualizar estado a fallido:', updateError)
          }
        })
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error)
      // Marcar como fallido si falla la extracción del PDF
      await prisma.medicalExam.update({
        where: { id: medicalExam.id },
        data: {
          processingStatus: 'failed',
        },
      }).catch(err => console.error('Error al actualizar estado fallido:', err))
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
