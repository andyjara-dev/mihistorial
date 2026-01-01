import { NextResponse } from 'next/server'
import { getProviderInfo } from '@/lib/ai-processor'

/**
 * Endpoint para ver la configuración actual de IA
 * GET /api/ai-info
 */
export async function GET() {
  const info = getProviderInfo()

  return NextResponse.json({
    provider: info.provider,
    name: info.name,
    cost: info.cost,
    configured: info.configured,
    error: info.error || null,
  })
}
