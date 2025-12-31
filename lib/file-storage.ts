import fs from 'fs/promises'
import path from 'path'
import { encryptFile, decryptFile } from './encryption'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

/**
 * Inicializa el directorio de subidas
 */
export async function initUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Guarda un archivo encriptado en el sistema de archivos
 */
export async function saveEncryptedFile(
  fileBuffer: Buffer,
  userId: string,
  userEncryptionKey: string,
  originalFileName: string
): Promise<{ filePath: string; encryptionIv: string; fileHash: string }> {
  await initUploadDir()

  // Encriptar el archivo
  const { encrypted, iv, hash } = encryptFile(fileBuffer, userEncryptionKey)

  // Generar nombre único para el archivo
  const timestamp = Date.now()
  const fileName = `${userId}_${timestamp}_${originalFileName}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  // Guardar el archivo encriptado
  await fs.writeFile(filePath, encrypted)

  return {
    filePath: fileName, // Solo guardamos el nombre relativo
    encryptionIv: iv,
    fileHash: hash,
  }
}

/**
 * Lee un archivo encriptado del sistema de archivos
 */
export async function readEncryptedFile(
  fileName: string,
  encryptionIv: string,
  userEncryptionKey: string
): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, fileName)

  const encryptedData = await fs.readFile(filePath)
  return decryptFile(encryptedData, encryptionIv, userEncryptionKey)
}

/**
 * Elimina un archivo del sistema de archivos
 */
export async function deleteFile(fileName: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, fileName)
  await fs.unlink(filePath)
}
