import pdf from 'pdf-parse'
import Anthropic from '@anthropic-ai/sdk'

/**
 * Extrae texto de un PDF
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(pdfBuffer)
    return data.text
  } catch (error) {
    console.error('Error al extraer texto del PDF:', error)
    throw new Error('No se pudo extraer el texto del PDF')
  }
}

/**
 * Procesa un examen médico con IA para extraer información estructurada
 */
export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY no configurada, retornando datos básicos')
    return {
      examType,
      institution,
      rawText: pdfText.substring(0, 500), // Solo primeros 500 caracteres
      processed: false,
    }
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const prompt = `Eres un asistente médico especializado en extraer información de exámenes médicos.

Analiza el siguiente examen médico y extrae la información relevante en formato JSON.

Tipo de examen: ${examType}
Institución: ${institution}

Contenido del examen:
${pdfText}

Por favor, extrae la siguiente información (si está disponible):
- Paciente (nombre, edad, género)
- Fecha del examen
- Médico solicitante
- Resultados principales (valores numéricos, rangos normales, etc.)
- Diagnósticos o comentarios
- Valores fuera de rango (si los hay)

Responde SOLO con un objeto JSON válido, sin texto adicional. Si algún campo no está disponible, usa null.

Formato de respuesta:
{
  "patient": {
    "name": "string o null",
    "age": "string o null",
    "gender": "string o null"
  },
  "examDate": "string (fecha en formato ISO) o null",
  "requestingDoctor": "string o null",
  "results": [
    {
      "test": "nombre del test",
      "value": "valor",
      "unit": "unidad",
      "normalRange": "rango normal",
      "isAbnormal": boolean
    }
  ],
  "diagnoses": ["lista de diagnósticos o comentarios"],
  "summary": "resumen breve del examen"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extraer el contenido de la respuesta
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada de la API')
    }

    // Parsear el JSON de la respuesta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta')
    }

    const extractedData = JSON.parse(jsonMatch[0])

    return {
      ...extractedData,
      examType,
      institution,
      processed: true,
      processedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error al procesar con IA:', error)

    // Fallback: retornar datos básicos si falla la IA
    return {
      examType,
      institution,
      rawText: pdfText.substring(0, 500),
      processed: false,
      error: 'Error al procesar con IA',
    }
  }
}
