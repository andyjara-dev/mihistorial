/**
 * Procesador de IA unificado que selecciona automáticamente el proveedor configurado
 */

import { getAIProvider, validateAIConfig } from './ai-config'
import * as gemini from './pdf-processor-gemini'
import * as claude from './pdf-processor'

/**
 * Extrae texto de un PDF (común para todos los proveedores)
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Ambos usan la misma implementación
  return gemini.extractTextFromPDF(pdfBuffer)
}

/**
 * Procesa un examen médico con el proveedor de IA configurado
 */
export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  // Validar configuración
  const config = validateAIConfig()

  if (!config.valid) {
    console.warn(`⚠️  ${config.error}`)
    console.warn('Procesando sin IA...')
    return {
      examType,
      institution,
      rawText: pdfText.substring(0, 500),
      processed: false,
      error: config.error,
    }
  }

  // Seleccionar proveedor
  const provider = config.provider

  console.log(`🤖 Procesando con: ${provider === 'gemini' ? 'Google Gemini (Gratis)' : 'Claude (Pagado)'}`)

  try {
    if (provider === 'gemini') {
      return await gemini.processExamWithAI(pdfText, examType, institution)
    } else {
      return await claude.processExamWithAI(pdfText, examType, institution)
    }
  } catch (error) {
    console.error(`Error al procesar con ${provider}:`, error)

    // Fallback: retornar datos básicos
    return {
      examType,
      institution,
      rawText: pdfText.substring(0, 500),
      processed: false,
      error: `Error al procesar con ${provider}`,
    }
  }
}

/**
 * Obtiene información del proveedor actual
 */
export function getProviderInfo() {
  const config = validateAIConfig()

  return {
    provider: config.provider,
    configured: config.valid,
    name: config.provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude',
    cost: config.provider === 'gemini' ? 'Gratis' : 'Pagado',
    error: config.error,
  }
}
