import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Extrae texto de un PDF usando Gemini Vision
 * Gemini puede procesar PDFs directamente sin necesidad de librerías adicionales
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Usar Gemini 2.5 Flash - modelo "todoterreno" equilibrado en velocidad y capacidad
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Convertir PDF a base64
    const base64Data = pdfBuffer.toString('base64')

    const prompt = 'Extrae TODO el texto de este documento PDF. Devuelve únicamente el texto extraído, sin comentarios adicionales.'

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    return text.trim()
  } catch (error) {
    console.error('Error al extraer texto del PDF:', error)
    throw new Error('No se pudo extraer el texto del PDF')
  }
}

/**
 * Procesa un examen médico con Google Gemini (GRATIS)
 */
export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('GEMINI_API_KEY no configurada, retornando datos básicos')
    return {
      examType,
      institution,
      rawText: pdfText.substring(0, 500),
      processed: false,
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
- Asegúrate de leer correctamente el archivo. A veces estos vienen con el resultado actual y un resultado anterior (de fecha pasada) en columnas, en ese caso extrae solo el resultado actual. 

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extraer el JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
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
