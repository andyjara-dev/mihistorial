import { encryptMetadata, decryptMetadata } from './encryption'

/**
 * Tipos para metadatos encriptados
 */
export interface ExamMetadata {
  examType: string
  institution?: string
  laboratory?: string
}

export interface AppointmentMetadata {
  doctorName: string
  location?: string
  institution?: string
}

export interface DocumentMetadata {
  fileName: string
  documentType?: string
}

/**
 * Helper para leer metadatos de examen (con fallback a campos legacy)
 */
export function getExamMetadata(
  exam: {
    encryptedMetadata?: string | null
    metadataIv?: string | null
    examType?: string
    institution?: string | null
    laboratory?: string | null
  },
  userEncryptionKey: string
): ExamMetadata {
  // Si tiene metadatos encriptados (nuevo sistema), usarlos
  if (exam.encryptedMetadata && exam.metadataIv) {
    try {
      return decryptMetadata<ExamMetadata>(
        exam.encryptedMetadata,
        exam.metadataIv,
        userEncryptionKey
      )
    } catch (error) {
      console.error('Error desencriptando metadatos de examen:', error)
      // Fallback a campos legacy
    }
  }

  // Fallback a campos legacy (compatibilidad con datos antiguos)
  return {
    examType: exam.examType || 'Desconocido',
    institution: exam.institution || undefined,
    laboratory: exam.laboratory || undefined
  }
}

/**
 * Helper para guardar metadatos de examen encriptados
 */
export function encryptExamMetadata(
  metadata: ExamMetadata,
  userEncryptionKey: string
): { encryptedMetadata: string; metadataIv: string } {
  const { encrypted, iv } = encryptMetadata(metadata, userEncryptionKey)
  return {
    encryptedMetadata: encrypted,
    metadataIv: iv
  }
}

/**
 * Helper para leer metadatos de cita (con fallback a campos legacy)
 */
export function getAppointmentMetadata(
  appointment: {
    encryptedMetadata?: string | null
    metadataIv?: string | null
    doctorName?: string | null
    location?: string | null
    institution?: string | null
  },
  userEncryptionKey: string
): AppointmentMetadata {
  // Si tiene metadatos encriptados, usarlos
  if (appointment.encryptedMetadata && appointment.metadataIv) {
    try {
      return decryptMetadata<AppointmentMetadata>(
        appointment.encryptedMetadata,
        appointment.metadataIv,
        userEncryptionKey
      )
    } catch (error) {
      console.error('Error desencriptando metadatos de cita:', error)
      // Fallback a campos legacy
    }
  }

  // Fallback a campos legacy
  return {
    doctorName: appointment.doctorName || 'Desconocido',
    location: appointment.location || undefined,
    institution: appointment.institution || undefined
  }
}

/**
 * Helper para guardar metadatos de cita encriptados
 */
export function encryptAppointmentMetadata(
  metadata: AppointmentMetadata,
  userEncryptionKey: string
): { encryptedMetadata: string; metadataIv: string } {
  const { encrypted, iv } = encryptMetadata(metadata, userEncryptionKey)
  return {
    encryptedMetadata: encrypted,
    metadataIv: iv
  }
}

/**
 * Helper para leer metadatos de documento (con fallback a campos legacy)
 */
export function getDocumentMetadata(
  document: {
    encryptedMetadata?: string | null
    metadataIv?: string | null
    fileName?: string | null
    documentType?: string | null
  },
  userEncryptionKey: string
): DocumentMetadata {
  // Si tiene metadatos encriptados, usarlos
  if (document.encryptedMetadata && document.metadataIv) {
    try {
      return decryptMetadata<DocumentMetadata>(
        document.encryptedMetadata,
        document.metadataIv,
        userEncryptionKey
      )
    } catch (error) {
      console.error('Error desencriptando metadatos de documento:', error)
      // Fallback a campos legacy
    }
  }

  // Fallback a campos legacy
  return {
    fileName: document.fileName || 'Desconocido',
    documentType: document.documentType || undefined
  }
}

/**
 * Helper para guardar metadatos de documento encriptados
 */
export function encryptDocumentMetadata(
  metadata: DocumentMetadata,
  userEncryptionKey: string
): { encryptedMetadata: string; metadataIv: string } {
  const { encrypted, iv } = encryptMetadata(metadata, userEncryptionKey)
  return {
    encryptedMetadata: encrypted,
    metadataIv: iv
  }
}
