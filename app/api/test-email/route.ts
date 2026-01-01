import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  // Verificar configuración
  const config = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 6) || 'no configurada',
    emailFrom: process.env.EMAIL_FROM || 'no configurada',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'no configurada',
  }

  // Si no hay clave, retornar error
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_XXXXXXXX') {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY no configurada correctamente',
      config,
      instructions: 'Ve a https://resend.com/api-keys para obtener tu API key'
    })
  }

  // Intentar enviar email de prueba
  const testEmail = request.nextUrl.searchParams.get('to')

  if (!testEmail) {
    return NextResponse.json({
      success: false,
      error: 'Falta parámetro ?to=tuemail@ejemplo.com',
      config
    })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MiHistorial.Cloud <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Email de prueba - MiHistorial.Cloud',
      html: `
        <h1>Email de prueba</h1>
        <p>Si recibes este email, la configuración de Resend está funcionando correctamente.</p>
        <p>Configuración actual:</p>
        <ul>
          <li>EMAIL_FROM: ${process.env.EMAIL_FROM}</li>
          <li>NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}</li>
        </ul>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      result,
      config
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error desconocido',
      errorDetails: error,
      config
    }, { status: 500 })
  }
}
