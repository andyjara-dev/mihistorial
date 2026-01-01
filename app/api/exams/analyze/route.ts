import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { extractTextFromPDF, processExamWithAI } from '@/lib/ai-processor'

/**
 * Endpoint para analizar un PDF y extraer información básica antes de guardarlo
 * POST /api/exams/analyze
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Parsear FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validaciones
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó un archivo' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo debe ser menor a 10MB' },
        { status: 400 }
      )
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Extraer texto del PDF
    const pdfText = await extractTextFromPDF(fileBuffer)

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto del PDF' },
        { status: 400 }
      )
    }

    // Procesar con IA para extraer metadatos
    // Usamos un prompt especial para extraer solo la información básica
    const extractedData = await extractMetadata(pdfText)

    return NextResponse.json({
      success: true,
      data: extractedData,
      textPreview: pdfText.substring(0, 300), // Preview para debugging
    })
  } catch (error) {
    console.error('Error al analizar PDF:', error)
    return NextResponse.json(
      { error: 'Error al analizar el PDF' },
      { status: 500 }
    )
  }
}

/**
 * Extrae metadatos básicos del PDF usando IA
 */
async function extractMetadata(pdfText: string): Promise<{
  examDate: string | null
  examType: string | null
  institution: string | null
}> {
  try {
    // Usar el procesador de IA para obtener metadatos
    const result = await processExamWithAI(
      pdfText,
      'Auto-detectar',
      'Auto-detectar'
    )

    // Intentar extraer la fecha del examen
    let examDate: string | null = null
    if (result.examDate && typeof result.examDate === 'string') {
      examDate = result.examDate
    } else if (result.data && typeof result.data === 'object') {
      const data = result.data as Record<string, unknown>
      if (data.examDate && typeof data.examDate === 'string') {
        examDate = data.examDate
      }
    }

    // Intentar detectar el tipo de examen
    let examType: string | null = null
    const textLower = pdfText.toLowerCase()

    if (textLower.includes('hemograma') || textLower.includes('sangre') || textLower.includes('hematología')) {
      examType = 'Sangre'
    } else if (textLower.includes('orina') || textLower.includes('urinario')) {
      examType = 'Orina'
    } else if (textLower.includes('rayos x') || textLower.includes('tomografía') || textLower.includes('tac') || textLower.includes('resonancia')) {
      examType = 'Imagenología'
    } else if (textLower.includes('ecg') || textLower.includes('electrocardiograma') || textLower.includes('ecocardiograma')) {
      examType = 'Cardiología'
    } else if (textLower.includes('hormona') || textLower.includes('tiroides') || textLower.includes('glucosa')) {
      examType = 'Endocrinología'
    }

    // Intentar extraer la institución
    let institution: string | null = null
    // Buscar patrones comunes en PDFs médicos
    const institutionPatterns = [
      /(?:laboratorio|centro|clínica|hospital)\s+([^\n]{10,60})/i,
      /([A-Z][a-zá-ú]+(?:\s+[A-Z][a-zá-ú]+){1,4})\s*(?:laboratorio|centro|clínica)/i,
    ]

    for (const pattern of institutionPatterns) {
      const match = pdfText.match(pattern)
      if (match && match[1]) {
        institution = match[1].trim()
        break
      }
    }

    // Si no se encontró institución con patrones, intentar extraerla de las primeras líneas
    if (!institution) {
      const lines = pdfText.split('\n').slice(0, 10)
      for (const line of lines) {
        if (line.length > 10 && line.length < 60 && /[A-Z]/.test(line)) {
          const trimmed = line.trim()
          if (!trimmed.match(/paciente|nombre|edad|sexo|fecha|doctor/i)) {
            institution = trimmed
            break
          }
        }
      }
    }

    return {
      examDate,
      examType,
      institution,
    }
  } catch (error) {
    console.error('Error al extraer metadatos:', error)
    return {
      examDate: null,
      examType: null,
      institution: null,
    }
  }
}
