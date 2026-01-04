import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { extractAppointmentFromEmail } from '@/lib/ai-appointment-extractor'

/**
 * POST /api/appointments/extract
 * Extrae información de una cita desde un email usando IA (Gemini)
 * NO crea la cita, solo retorna los datos extraídos para que el usuario revise
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Parsear body
    const body = await request.json()
    const { emailText } = body

    // Validar que se envió el email
    if (!emailText || typeof emailText !== 'string' || !emailText.trim()) {
      return NextResponse.json(
        { error: 'El campo emailText es requerido y debe contener el texto del email' },
        { status: 400 }
      )
    }

    // Extraer datos con IA
    const result = await extractAppointmentFromEmail(emailText.trim())

    return NextResponse.json({
      extracted: result.extracted,
      confidence: result.confidence,
      rawEmail: emailText,
    })
  } catch (error) {
    console.error('Error al extraer datos de email:', error)

    // Retornar datos vacíos en caso de error (el usuario puede llenar manualmente)
    return NextResponse.json(
      {
        extracted: {
          doctorName: null,
          specialty: null,
          appointmentDate: null,
          location: null,
          notes: null,
        },
        confidence: 'low',
        error: 'Error al procesar el email con IA. Por favor, completa los datos manualmente.',
      },
      { status: 200 } // No es un error del cliente, sino del procesamiento AI
    )
  }
}
