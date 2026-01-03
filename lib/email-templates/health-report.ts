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

interface HealthAdvice {
  summary: string
  overallStatus: 'good' | 'attention' | 'concerning'
  keyFindings: string[]
  recommendations: {
    diet: string[]
    exercise: string[]
    medicalFollowUp: string[]
  }
  positiveAspects: string[]
  areasForImprovement: string[]
}

interface EmailParams {
  to: string
  userName: string
  reportId: string
  reportData: HealthAdvice
  periodMonths: number
  examCount: number
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'good':
      return '✅'
    case 'attention':
      return '⚠️'
    case 'concerning':
      return '🚨'
    default:
      return '📊'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'good':
      return 'Bueno'
    case 'attention':
      return 'Requiere Atención'
    case 'concerning':
      return 'Preocupante'
    default:
      return 'Indeterminado'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
      return '#10B981' // green
    case 'attention':
      return '#F59E0B' // amber
    case 'concerning':
      return '#EF4444' // red
    default:
      return '#6B7280' // gray
  }
}

function generateHealthReportHTML(params: EmailParams): string {
  const { userName, reportId, reportData, periodMonths, examCount } = params
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/health-reports/${reportId}`
  const statusEmoji = getStatusEmoji(reportData.overallStatus)
  const statusText = getStatusText(reportData.overallStatus)
  const statusColor = getStatusColor(reportData.overallStatus)

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
      <h1 style="color: white; margin: 0; font-size: 28px;">🏥 Tu Reporte de Salud</h1>
      <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">Análisis de los últimos ${periodMonths} meses</p>
    </div>

    <!-- Contenido Principal -->
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; margin-top: 0;">Hola ${userName},</p>

      <p>Hemos analizado tus últimos <strong>${examCount} exámenes médicos</strong> y generado un reporte personalizado con consejos para tu salud.</p>

      <!-- Estado General -->
      <div style="background: #f3f4f6; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px;">
          ${statusEmoji} Estado General: <span style="color: ${statusColor};">${statusText}</span>
        </h3>
        <p style="margin: 0; color: #4B5563;">${reportData.summary}</p>
      </div>

      <!-- Hallazgos Principales -->
      ${reportData.keyFindings.length > 0 ? `
      <div style="margin: 25px 0;">
        <h3 style="color: #0F766E; margin-bottom: 15px; font-size: 18px;">🔍 Hallazgos Importantes</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${reportData.keyFindings.map(finding => `
            <li style="margin-bottom: 8px; color: #374151;">${finding}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Consejos Personalizados -->
      <div style="margin: 25px 0;">
        <h3 style="color: #0F766E; margin-bottom: 15px; font-size: 18px;">💡 Consejos Personalizados</h3>

        ${reportData.recommendations.diet.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 10px; font-size: 16px;">🥗 Alimentación</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${reportData.recommendations.diet.map(diet => `
              <li style="margin-bottom: 6px; color: #374151;">${diet}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${reportData.recommendations.exercise.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 10px; font-size: 16px;">🏃 Ejercicio</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${reportData.recommendations.exercise.map(exercise => `
              <li style="margin-bottom: 6px; color: #374151;">${exercise}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${reportData.recommendations.medicalFollowUp.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 10px; font-size: 16px;">🩺 Seguimiento Médico</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${reportData.recommendations.medicalFollowUp.map(followUp => `
              <li style="margin-bottom: 6px; color: #374151;">${followUp}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- Aspectos Positivos -->
      ${reportData.positiveAspects.length > 0 ? `
      <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="color: #059669; margin: 0 0 10px 0; font-size: 16px;">✨ Aspectos Positivos</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${reportData.positiveAspects.map(aspect => `
            <li style="margin-bottom: 6px; color: #065F46;">${aspect}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Botón para ver reporte completo -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}"
           style="background: #14B8A6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
          Ver Reporte Completo en el Dashboard
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

      <!-- Disclaimer -->
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>⚠️ Importante:</strong> Este reporte es informativo y generado con asistencia de inteligencia artificial. No reemplaza el consejo médico profesional. Consulta siempre con tu médico antes de hacer cambios significativos en tu dieta, ejercicio o tratamiento médico.
        </p>
      </div>

      <!-- Footer -->
      <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
        Saludos,<br>
        El equipo de MiHistorial.Cloud
      </p>

      <p style="font-size: 11px; color: #9CA3AF; margin-top: 15px;">
        Este email fue generado automáticamente. Si no solicitaste este reporte, puedes ignorar este mensaje.
      </p>
    </div>
  </body>
</html>
  `
}

export async function sendHealthReportEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient()

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MiHistorial.Cloud <noreply@mihistorial.cloud>',
      to: params.to,
      subject: `🏥 Tu Reporte de Salud - Análisis de ${params.periodMonths} meses`,
      html: generateHealthReportHTML(params),
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending health report email:', error)
    return { success: false, error: 'Error al enviar email' }
  }
}
