import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptFile } from '@/lib/encryption'
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

    const { id: documentId } = await params

    // Obtener el documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // Verificar que el documento pertenece al usuario
    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener la clave de encriptación del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Leer el archivo encriptado
    const encryptedFilePath = path.join(process.cwd(), 'uploads', document.filePath)
    const encryptedBuffer = await fs.readFile(encryptedFilePath)

    // Desencriptar el archivo
    const decryptedBuffer = decryptFile(
      encryptedBuffer,
      document.encryptionIv,
      user.encryptionKey
    )

    // Retornar el archivo con los headers apropiados
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      headers: {
        'Content-Type': document.fileType,
        'Content-Disposition': `inline; filename="${document.fileName}"`,
        'Content-Length': decryptedBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error al obtener documento:', error)
    return NextResponse.json(
      { error: 'Error al obtener el documento' },
      { status: 500 }
    )
  }
}
