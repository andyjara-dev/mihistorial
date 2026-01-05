import { GoogleGenerativeAI } from '@google/generative-ai'

interface ExtractedAppointment {
  doctorName: string | null
  specialty: string | null
  appointmentDate: string | null  // ISO format
  location: string | null
  notes: string | null
}

export interface AppointmentExtractionResult {
  extracted: ExtractedAppointment
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Extrae información de una cita médica desde un email usando Gemini AI
 */
export async function extractAppointmentFromEmail(
  emailText: string
): Promise<AppointmentExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('GEMINI_API_KEY no configurada, retornando datos vacíos')
    return {
      extracted: {
        doctorName: null,
        specialty: null,
        appointmentDate: null,
        location: null,
        notes: null,
      },
      confidence: 'low',
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Eres un asistente especializado en extraer información de citas médicas desde emails.

Analiza el siguiente email y extrae los datos de la cita médica.

EMAIL:
${emailText}

INSTRUCCIONES:
1. Extrae el nombre del doctor/profesional de salud (solo el nombre, sin título "Dr." o "Dra.")
2. Identifica la especialidad médica (ej: Cardiología, Oftalmología, Medicina General, Dermatología)
3. Extrae la fecha y hora de la cita y conviértela a formato ISO 8601: YYYY-MM-DDTHH:MM:SS
4. Identifica la ubicación completa (dirección, clínica, hospital, consultorio)
5. Extrae cualquier nota relevante (instrucciones de preparación, ayuno, documentos a llevar, número de confirmación)

EJEMPLOS de buenos resultados:
- doctorName: "Juan Pérez" (NO "Dr. Juan Pérez")
- specialty: "Cardiología" (NO "cardiólogo" ni "Dr. Cardiólogo")
- appointmentDate: "2025-02-15T14:30:00" (para 15 de febrero de 2025 a las 2:30 PM)
- appointmentDate: "2025-01-20T09:00:00" (para 20 de enero de 2025 a las 9:00 AM)
- location: "Hospital UC Christus, Av. Libertador Bernardo O'Higgins 340, Santiago"
- notes: "Traer exámenes previos, ayuno de 8 horas, llegar 15 minutos antes"

REGLAS IMPORTANTES:
- Si el email menciona "Dr." o "Dra." antes del nombre, NO lo incluyas en doctorName
- La fecha DEBE estar en formato ISO: YYYY-MM-DDTHH:MM:SS
- Si encuentras "14:30 hrs" o "2:30 PM", conviértelo a formato 24 horas
- Si no encuentras algún dato, usa null (no strings vacíos)

Responde SOLO con un objeto JSON válido (sin markdown, sin bloques de código):
{
  "doctorName": "string o null",
  "specialty": "string o null",
  "appointmentDate": "string ISO o null",
  "location": "string o null",
  "notes": "string o null",
  "confidence": "high" | "medium" | "low"
}

Criterios de confidence:
- "high": Encontraste doctor, specialty, appointmentDate con claridad
- "medium": Encontraste al menos 2-3 campos principales
- "low": Información muy limitada o ambigua`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Limpiar posibles markdown wrappers
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '')
    }

    // Extraer JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini')
    }

    const data = JSON.parse(jsonMatch[0])

    return {
      extracted: {
        doctorName: data.doctorName || null,
        specialty: data.specialty || null,
        appointmentDate: data.appointmentDate || null,
        location: data.location || null,
        notes: data.notes || null,
      },
      confidence: data.confidence || 'medium',
    }
  } catch (error) {
    console.error('Error al extraer cita con IA:', error)

    // Fallback: intentar extracción básica con regex (muy limitado)
    const fallbackData = attemptBasicExtraction(emailText)

    return {
      extracted: fallbackData,
      confidence: 'low',
    }
  }
}

/**
 * Intento básico de extracción con regex cuando falla la IA (fallback)
 */
function attemptBasicExtraction(emailText: string): ExtractedAppointment {
  // Intentar encontrar fecha (muy básico, solo para fallback)
  const datePatterns = [
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
    /(\d{4})-(\d{2})-(\d{2})/,
  ]

  let extractedDate: string | null = null
  for (const pattern of datePatterns) {
    const match = emailText.match(pattern)
    if (match) {
      // Intentar construir fecha ISO (muy simplificado)
      extractedDate = match[0]
      break
    }
  }

  return {
    doctorName: null,
    specialty: null,
    appointmentDate: extractedDate,
    location: null,
    notes: null,
  }
}
