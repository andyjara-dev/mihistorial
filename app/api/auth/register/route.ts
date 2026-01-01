import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateUserEncryptionKey } from '@/lib/encryption'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { createVerificationToken, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, recaptchaToken } = await request.json()

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verificar reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Por favor completa la verificación de reCAPTCHA' },
        { status: 400 }
      )
    }

    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: 'Verificación de reCAPTCHA fallida. Por favor intenta de nuevo' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password)

    // Generar clave de encriptación única para el usuario
    const encryptionKey = generateUserEncryptionKey()

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        encryptionKey,
        emailVerified: null, // Email no verificado inicialmente
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // Crear token y enviar email de verificación
    try {
      const verificationToken = await createVerificationToken(email)
      const emailResult = await sendVerificationEmail(email, verificationToken)

      if (!emailResult.success) {
        console.error('Error al enviar email de verificación:', emailResult.error)
        // No falla el registro si el email falla, pero lo registramos
      }
    } catch (emailError) {
      console.error('Error al procesar verificación de email:', emailError)
      // Continuar aunque falle el envío del email
    }

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente. Por favor verifica tu email para activar tu cuenta.',
        user,
        emailSent: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
