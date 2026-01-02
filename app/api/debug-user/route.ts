import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Endpoint temporal para debug - ver datos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        emailVerified: true,
      }
    })

    return NextResponse.json({
      user,
      env: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'no configurada',
        aiProvider: process.env.AI_PROVIDER,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
