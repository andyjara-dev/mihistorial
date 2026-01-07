/**
 * Sistema de cola con debouncing para generación de reportes de salud
 *
 * Consolida múltiples exámenes subidos en un período corto en un solo reporte,
 * evitando correos duplicados.
 */

import { generateHealthReport } from './health-report-generator'

interface QueuedReport {
  userId: string
  encryptionKey: string
  examId: string
  timerId: NodeJS.Timeout
  timestamp: number
}

class HealthReportQueue {
  private queue: Map<string, QueuedReport> = new Map()
  private readonly DEBOUNCE_MS = 30000 // 30 segundos

  /**
   * Encola un examen para generación de reporte con debouncing
   *
   * Si ya existe una cola para este usuario, reinicia el timer.
   * Esto permite que múltiples exámenes subidos en ráfaga se consoliden
   * en un solo reporte.
   */
  enqueueReport(userId: string, encryptionKey: string, examId: string): void {
    const existingQueue = this.queue.get(userId)

    // Si ya existe una cola para este usuario, cancelar el timer anterior
    if (existingQueue) {
      clearTimeout(existingQueue.timerId)
      console.log(
        `⏱️ Reiniciando timer de reporte para usuario ${userId} (nuevo examen: ${examId})`
      )
    } else {
      console.log(
        `📋 Encolando generación de reporte para usuario ${userId} (examen: ${examId})`
      )
    }

    // Crear nuevo timer con debouncing
    const timerId = setTimeout(() => {
      this.processQueue(userId)
    }, this.DEBOUNCE_MS)

    // Guardar en la cola
    this.queue.set(userId, {
      userId,
      encryptionKey,
      examId, // Guardamos el último examen que disparó la cola
      timerId,
      timestamp: Date.now(),
    })
  }

  /**
   * Procesa la cola para un usuario específico
   *
   * Genera el reporte de salud consolidando todos los exámenes
   * procesados en el período de debouncing.
   */
  private async processQueue(userId: string): Promise<void> {
    const queuedReport = this.queue.get(userId)

    if (!queuedReport) {
      console.warn(`⚠️ No se encontró cola para usuario ${userId}`)
      return
    }

    const { encryptionKey, examId } = queuedReport

    console.log(
      `🏥 Generando reporte de salud para usuario ${userId} (disparado por examen ${examId})`
    )

    try {
      const reportId = await generateHealthReport(
        userId,
        encryptionKey,
        examId
      )

      if (reportId) {
        console.log(`✅ Reporte de salud generado exitosamente: ${reportId}`)
      } else {
        console.log(`ℹ️ No se generó nuevo reporte (ya existe uno para hoy)`)
      }
    } catch (error) {
      console.error(
        `❌ Error al generar reporte de salud para usuario ${userId}:`,
        error
      )
    } finally {
      // Remover de la cola
      this.queue.delete(userId)
    }
  }

  /**
   * Obtiene el estado actual de la cola (útil para debugging)
   */
  getQueueStatus(): Array<{
    userId: string
    examId: string
    queuedAt: Date
    willProcessIn: number
  }> {
    const now = Date.now()
    return Array.from(this.queue.values()).map((item) => ({
      userId: item.userId,
      examId: item.examId,
      queuedAt: new Date(item.timestamp),
      willProcessIn: Math.max(
        0,
        this.DEBOUNCE_MS - (now - item.timestamp)
      ),
    }))
  }

  /**
   * Fuerza el procesamiento inmediato de todos los reportes encolados
   * (útil para testing o shutdown graceful)
   */
  async flushAll(): Promise<void> {
    const userIds = Array.from(this.queue.keys())

    console.log(`🚀 Procesando ${userIds.length} reportes encolados...`)

    for (const userId of userIds) {
      const queuedReport = this.queue.get(userId)
      if (queuedReport) {
        clearTimeout(queuedReport.timerId)
        await this.processQueue(userId)
      }
    }
  }

  /**
   * Cancela un reporte encolado para un usuario
   */
  cancelReport(userId: string): boolean {
    const queuedReport = this.queue.get(userId)

    if (queuedReport) {
      clearTimeout(queuedReport.timerId)
      this.queue.delete(userId)
      console.log(`❌ Reporte cancelado para usuario ${userId}`)
      return true
    }

    return false
  }
}

// Singleton instance
export const healthReportQueue = new HealthReportQueue()
