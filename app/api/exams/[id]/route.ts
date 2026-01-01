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

    return NextResponse.json({
      id: exam.id,
      examType: exam.examType,
      institution: exam.institution,
      examDate: exam.examDate,
      processingStatus: exam.processingStatus,
      aiProcessed: exam.aiProcessed,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      document: exam.document ? {
        id: exam.document.id,
        fileName: exam.document.fileName,
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
