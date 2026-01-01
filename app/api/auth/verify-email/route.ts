import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token no proporcionado' },
      { status: 400 }
    )
  }

  const result = await verifyEmailToken(token)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
      email: result.email,
    })
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }
}
