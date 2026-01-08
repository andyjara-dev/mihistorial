import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptData } from '@/lib/encryption'
import { getExamMetadata, getDocumentMetadata } from '@/lib/metadata-helpers'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: examId } = await params

    // Obtener el examen con sus relaciones
    const exam = await prisma.medicalExam.findUnique({
      where: { id: examId },
      include: {
        document: true,
      },
    })

    if (!exam) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    // Verificar que el examen pertenece al usuario
    if (exam.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener la clave de encriptación del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Desencriptar los datos
    let decryptedData = null
    try {
      const decrypted = decryptData(
        exam.encryptedData,
        exam.encryptionIv,
        user.encryptionKey
      )
      decryptedData = JSON.parse(decrypted)
    } catch (error) {
      console.error('Error al desencriptar datos:', error)
      decryptedData = { error: 'No se pudieron desencriptar los datos' }
    }

    // Desencriptar metadatos del examen
    const examMetadata = getExamMetadata(exam, user.encryptionKey)

    // Desencriptar metadatos del documento si existe
    let documentMetadata = null
    if (exam.document) {
      documentMetadata = getDocumentMetadata(exam.document, user.encryptionKey)
    }

    return NextResponse.json({
      id: exam.id,
      examType: examMetadata.examType,
      institution: examMetadata.institution,
      laboratory: examMetadata.laboratory,
      examDate: exam.examDate,
      processingStatus: exam.processingStatus,
      aiProcessed: exam.aiProcessed,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      document: exam.document ? {
        id: exam.document.id,
        fileName: documentMetadata?.fileName || exam.document.fileName,
        documentType: documentMetadata?.documentType,
        fileType: exam.document.fileType,
        fileSize: exam.document.fileSize,
        uploadedAt: exam.document.uploadedAt,
      } : null,
      data: decryptedData,
    })
  } catch (error) {
    console.error('Error al obtener examen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id: examId } = await params

    // Obtener el examen con sus relaciones
    const exam = await prisma.medicalExam.findUnique({
      where: { id: examId },
      include: {
        document: {
          include: {
            medicalExams: true,
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    // Verificar que el examen pertenece al usuario
    if (exam.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Eliminar el examen
    await prisma.medicalExam.delete({
      where: { id: examId },
    })

    console.log(`🗑️ Examen eliminado: ${examId}`)

    // Si el documento asociado no tiene otros exámenes, eliminarlo también
    if (exam.document && exam.document.medicalExams.length === 1) {
      const documentId = exam.document.id
      const filePath = exam.document.filePath

      // Eliminar el archivo físico
      try {
        const fullPath = path.join(process.cwd(), filePath)
        await fs.unlink(fullPath)
        console.log(`🗑️ Archivo eliminado: ${filePath}`)
      } catch (error) {
        console.error('Error al eliminar archivo:', error)
        // Continuar aunque falle la eliminación del archivo
      }

      // Eliminar el documento de la base de datos
      await prisma.document.delete({
        where: { id: documentId },
      })

      console.log(`🗑️ Documento eliminado: ${documentId}`)
    }

    return NextResponse.json({
      message: 'Examen eliminado exitosamente',
      deletedExamId: examId,
    })
  } catch (error) {
    console.error('Error al eliminar examen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
