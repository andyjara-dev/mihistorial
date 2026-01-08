import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { encryptMetadata } from '../lib/encryption'

/**
 * Script de migración para encriptar metadatos existentes
 * 
 * Este script:
 * 1. Lee todos los registros existentes
 * 2. Encripta metadatos sensibles
 * 3. Mantiene los campos legacy por compatibilidad
 * 4. Es idempotente (puede ejecutarse múltiples veces)
 */

async function migrateExams() {
  console.log('🔄 Migrando MedicalExam...')
  
  const exams = await prisma.medicalExam.findMany({
    where: {
      encryptedMetadata: null // Solo migrar los que no tienen metadata encriptada
    },
    include: {
      user: true
    }
  })

  let migrated = 0
  let skipped = 0

  for (const exam of exams) {
    try {
      const metadata: any = {}
      
      // Agregar campos que existen
      if (exam.examType) metadata.examType = exam.examType
      if (exam.institution) metadata.institution = exam.institution
      if ((exam as any).laboratory) metadata.laboratory = (exam as any).laboratory

      // Si no hay metadatos, saltar
      if (Object.keys(metadata).length === 0) {
        skipped++
        continue
      }

      // Encriptar
      const { encrypted, iv } = encryptMetadata(metadata, exam.user.encryptionKey)

      // Actualizar registro
      await prisma.medicalExam.update({
        where: { id: exam.id },
        data: {
          encryptedMetadata: encrypted,
          metadataIv: iv
        }
      })

      migrated++
    } catch (error) {
      console.error(`❌ Error migrando exam ${exam.id}:`, error)
    }
  }

  console.log(`  ✅ Migrados: ${migrated}, Omitidos: ${skipped}`)
}

async function migrateAppointments() {
  console.log('🔄 Migrando Appointment...')
  
  const appointments = await prisma.appointment.findMany({
    where: {
      encryptedMetadata: null
    },
    include: {
      user: true
    }
  })

  let migrated = 0
  let skipped = 0

  for (const appointment of appointments) {
    try {
      const metadata: any = {}
      
      if (appointment.doctorName) metadata.doctorName = appointment.doctorName
      if (appointment.location) metadata.location = appointment.location
      if ((appointment as any).institution) metadata.institution = (appointment as any).institution

      if (Object.keys(metadata).length === 0) {
        skipped++
        continue
      }

      const { encrypted, iv } = encryptMetadata(metadata, appointment.user.encryptionKey)

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          encryptedMetadata: encrypted,
          metadataIv: iv
        }
      })

      migrated++
    } catch (error) {
      console.error(`❌ Error migrando appointment ${appointment.id}:`, error)
    }
  }

  console.log(`  ✅ Migrados: ${migrated}, Omitidos: ${skipped}`)
}

async function migrateDocuments() {
  console.log('🔄 Migrando Document...')
  
  const documents = await prisma.document.findMany({
    where: {
      encryptedMetadata: null
    },
    include: {
      user: true
    }
  })

  let migrated = 0
  let skipped = 0

  for (const document of documents) {
    try {
      const metadata: any = {}
      
      if (document.fileName) metadata.fileName = document.fileName
      if ((document as any).documentType) metadata.documentType = (document as any).documentType

      if (Object.keys(metadata).length === 0) {
        skipped++
        continue
      }

      const { encrypted, iv } = encryptMetadata(metadata, document.user.encryptionKey)

      await prisma.document.update({
        where: { id: document.id },
        data: {
          encryptedMetadata: encrypted,
          metadataIv: iv
        }
      })

      migrated++
    } catch (error) {
      console.error(`❌ Error migrando document ${document.id}:`, error)
    }
  }

  console.log(`  ✅ Migrados: ${migrated}, Omitidos: ${skipped}`)
}

async function main() {
  console.log('🔐 Iniciando migración de metadatos a campos encriptados...\n')
  
  try {
    await migrateExams()
    await migrateAppointments()
    await migrateDocuments()
    
    console.log('\n✅ Migración completada exitosamente!')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
