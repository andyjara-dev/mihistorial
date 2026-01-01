import { Resend } from 'resend'
import crypto from 'crypto'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Genera un token único para verificación de email
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Crea un token de verificación en la base de datos
 */
export async function createVerificationToken(email: string) {
  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  // Eliminar tokens anteriores para este email
  await prisma.emailVerificationToken.deleteMany({
    where: { email }
  })

  // Crear nuevo token
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    }
  })

  return token
}

/**
 * Verifica un token de verificación de email
 */
export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return { success: false, error: 'Token inválido' }
  }

  if (verificationToken.expires < new Date()) {
    await prisma.emailVerificationToken.delete({
      where: { token }
    })
    return { success: false, error: 'Token expirado' }
  }

  // Actualizar usuario como verificado
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() }
  })

  // Eliminar token usado
  await prisma.emailVerificationToken.delete({
    where: { token }
  })

  return { success: true, email: verificationToken.email }
}

/**
 * Envía email de verificación usando Resend
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MiHistorial.Cloud <noreply@mihistorial.cloud>',
      to: email,
      subject: 'Verifica tu cuenta en MiHistorial.Cloud',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MiHistorial.Cloud</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #0F766E; margin-top: 0;">¡Bienvenido!</h2>

              <p>Gracias por registrarte en MiHistorial.Cloud, tu centro médico personal seguro y privado.</p>

              <p>Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}"
                   style="background: #14B8A6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Verificar Email
                </a>
              </div>

              <p style="font-size: 14px; color: #666;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${verificationUrl}" style="color: #14B8A6; word-break: break-all;">${verificationUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #999;">
                Este enlace expirará en 24 horas por seguridad.<br>
                Si no creaste esta cuenta, puedes ignorar este email.
              </p>

              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Saludos,<br>
                El equipo de MiHistorial.Cloud
              </p>
            </div>
          </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: 'Error al enviar email' }
  }
}
