import { NextRequest, NextResponse } from 'next/server'
import { checkAndSendReminders } from '@/lib/appointment-reminders'

/**
 * POST /api/appointments/reminders/check
 * Verifica y envía recordatorios pendientes
 * Este endpoint debe ser llamado periódicamente por un cron job externo
 * Por ejemplo: GitHub Actions, crontab del servidor, Vercel Cron, etc.
 *
 * Para seguridad, puedes agregar autenticación con API key en el futuro
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📬 Manual reminder check triggered')

    // Ejecutar verificación de recordatorios
    const stats = await checkAndSendReminders()

    return NextResponse.json({
      success: true,
      message: 'Verificación de recordatorios completada',
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error al verificar recordatorios:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al verificar recordatorios',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/appointments/reminders/check
 * Permite verificar el endpoint (solo para debugging)
 */
export async function GET() {
  return NextResponse.json({
    message: 'Reminder check endpoint activo',
    instructions: 'Usa POST para ejecutar la verificación de recordatorios',
    cronSuggestion: 'Configura un cron job para llamar a este endpoint diariamente',
    exampleCron: 'curl -X POST https://tudominio.com/api/appointments/reminders/check',
  })
}
