import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

interface ReminderParams {
  to: string
  userName: string
  doctorName: string
  specialty: string
  appointmentDate: Date
  location: string
  daysUntil: number  // 1 o 3
}

function generateReminderHTML(params: ReminderParams): string {
  const { userName, doctorName, specialty, appointmentDate, location, daysUntil } = params
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/appointments`

  const dateStr = appointmentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timeStr = appointmentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const urgencyEmoji = daysUntil === 1 ? '🚨' : '🔔'
  const urgencyText = daysUntil === 1
    ? 'Tu cita médica es MAÑANA'
    : 'Recordatorio: Tienes una cita médica en 3 días'

  const urgencyColor = daysUntil === 1 ? '#DC2626' : '#0F766E'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${urgencyEmoji} Recordatorio de Cita Médica</h1>
      <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">${urgencyText}</p>
    </div>

    <!-- Contenido Principal -->
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; margin-top: 0;">Hola ${userName},</p>

      <p>Te recordamos que tienes una cita médica programada:</p>

      <!-- Detalles de la cita -->
      <div style="background: #F0FDFA; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <div style="margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #0F766E; font-weight: bold;">DOCTOR/A</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; color: #1F2937; font-weight: bold;">Dr(a). ${doctorName}</p>
          <p style="margin: 2px 0 0 0; font-size: 14px; color: #6B7280;">${specialty}</p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #0F766E; font-weight: bold;">FECHA Y HORA</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #1F2937; text-transform: capitalize;">${dateStr}</p>
          <p style="margin: 2px 0 0 0; font-size: 18px; color: #1F2937; font-weight: bold;">${timeStr}</p>
        </div>

        <div>
          <p style="margin: 0; font-size: 14px; color: #0F766E; font-weight: bold;">UBICACIÓN</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #1F2937;">${location}</p>
        </div>
      </div>

      <!-- Recomendaciones -->
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>💡 Recomendaciones:</strong>
        </p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400E; font-size: 14px;">
          <li>Llega 10-15 minutos antes de tu hora</li>
          <li>Lleva tu identificación y documentos médicos relevantes</li>
          <li>Verifica si necesitas ayuno u otra preparación especial</li>
        </ul>
      </div>

      <!-- Botón al Dashboard -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}"
           style="background: #14B8A6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
          Ver en Mi Dashboard
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

      <!-- Footer -->
      <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
        Saludos,<br>
        El equipo de MiHistorial.Cloud
      </p>

      <p style="font-size: 11px; color: #9CA3AF; margin-top: 15px;">
        Este recordatorio fue enviado automáticamente. Si necesitas cancelar o reprogramar, contacta directamente con el centro médico.
      </p>
    </div>
  </body>
</html>
  `
}

export async function sendAppointmentReminderEmail(
  params: ReminderParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient()

    const subject = params.daysUntil === 1
      ? `🚨 Recordatorio: Tu cita médica es MAÑANA`
      : `🔔 Recordatorio: Cita médica en ${params.daysUntil} días`

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MiHistorial.Cloud <noreply@mihistorial.cloud>',
      to: params.to,
      subject,
      html: generateReminderHTML(params),
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending appointment reminder email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email',
    }
  }
}
