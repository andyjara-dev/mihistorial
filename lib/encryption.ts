import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Obtiene la clave maestra de encriptación desde las variables de entorno
 */
function getMasterKey(): Buffer {
  const key = process.env.MASTER_ENCRYPTION_KEY
  if (!key) {
    throw new Error('MASTER_ENCRYPTION_KEY no está configurada')
  }

  // Si la clave es base64, decodificarla
  const keyBuffer = Buffer.from(key, 'base64')

  // Si no es de 32 bytes, derivar una clave usando SHA-256
  if (keyBuffer.length !== KEY_LENGTH) {
    return crypto.createHash('sha256').update(key).digest()
  }

  return keyBuffer
}

/**
 * Genera una clave de encriptación única para un usuario
 */
export function generateUserEncryptionKey(): string {
  const userKey = crypto.randomBytes(KEY_LENGTH)
  const masterKey = getMasterKey()

  // Encriptar la clave del usuario con la clave maestra
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)

  const encrypted = Buffer.concat([
    cipher.update(userKey),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  // Retornar: iv + authTag + encrypted en base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

/**
 * Desencripta la clave de encriptación de un usuario
 */
function decryptUserKey(encryptedUserKey: string): Buffer {
  const masterKey = getMasterKey()
  const buffer = Buffer.from(encryptedUserKey, 'base64')

  // Extraer iv, authTag y datos encriptados
  const iv = buffer.subarray(0, IV_LENGTH)
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
}

/**
 * Encripta datos sensibles usando la clave del usuario
 */
export function encryptData(
  data: string,
  encryptedUserKey: string
): { encrypted: string; iv: string } {
  const userKey = decryptUserKey(encryptedUserKey)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, userKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  // Retornar encrypted + authTag en base64, y el iv separado
  return {
    encrypted: Buffer.concat([encrypted, authTag]).toString('base64'),
    iv: iv.toString('base64')
  }
}

/**
 * Desencripta datos usando la clave del usuario
 */
export function decryptData(
  encryptedData: string,
  ivString: string,
  encryptedUserKey: string
): string {
  const userKey = decryptUserKey(encryptedUserKey)
  const iv = Buffer.from(ivString, 'base64')
  const buffer = Buffer.from(encryptedData, 'base64')

  // Separar datos encriptados y authTag
  const authTag = buffer.subarray(buffer.length - AUTH_TAG_LENGTH)
  const encrypted = buffer.subarray(0, buffer.length - AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, userKey, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8')
}

/**
 * Encripta un archivo (Buffer) usando la clave del usuario
 */
export function encryptFile(
  fileBuffer: Buffer,
  encryptedUserKey: string
): { encrypted: Buffer; iv: string; hash: string } {
  const userKey = decryptUserKey(encryptedUserKey)
  const iv = crypto.randomBytes(IV_LENGTH)

  // Calcular hash SHA-256 del archivo original
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

  const cipher = crypto.createCipheriv(ALGORITHM, userKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  return {
    encrypted: Buffer.concat([encrypted, authTag]),
    iv: iv.toString('base64'),
    hash
  }
}

/**
 * Desencripta un archivo usando la clave del usuario
 */
export function decryptFile(
  encryptedBuffer: Buffer,
  ivString: string,
  encryptedUserKey: string
): Buffer {
  const userKey = decryptUserKey(encryptedUserKey)
  const iv = Buffer.from(ivString, 'base64')

  // Separar datos encriptados y authTag
  const authTag = encryptedBuffer.subarray(encryptedBuffer.length - AUTH_TAG_LENGTH)
  const encrypted = encryptedBuffer.subarray(0, encryptedBuffer.length - AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, userKey, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
}

/**
 * Hashea un password con bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt')
  return bcrypt.hash(password, 12)
}

/**
 * Verifica un password contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt')
  return bcrypt.compare(password, hash)
}

/**
 * Encripta metadatos sensibles como un objeto JSON
 * Útil para encriptar campos como: {doctorName, location, institution}
 */
export function encryptMetadata(
  metadata: Record<string, any>,
  encryptedUserKey: string
): { encrypted: string; iv: string } {
  const jsonString = JSON.stringify(metadata)
  return encryptData(jsonString, encryptedUserKey)
}

/**
 * Desencripta metadatos previamente encriptados
 * Retorna el objeto JSON original
 */
export function decryptMetadata<T = Record<string, any>>(
  encryptedMetadata: string,
  ivString: string,
  encryptedUserKey: string
): T {
  const jsonString = decryptData(encryptedMetadata, ivString, encryptedUserKey)
  return JSON.parse(jsonString) as T
}

/**
 * Helper para migrar datos: encripta metadatos si aún no están encriptados
 * Retorna null si no hay datos para encriptar
 */
export function migrateToEncryptedMetadata(
  plainMetadata: Record<string, any>,
  encryptedUserKey: string
): { encrypted: string; iv: string } | null {
  // Filtrar valores nulos/undefined/vacíos
  const filteredMetadata = Object.entries(plainMetadata)
    .filter(([_, value]) => value != null && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  // Si no hay metadatos válidos, retornar null
  if (Object.keys(filteredMetadata).length === 0) {
    return null
  }

  return encryptMetadata(filteredMetadata, encryptedUserKey)
}
