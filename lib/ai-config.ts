/**
 * Configuración centralizada de IA para procesamiento de PDFs
 *
 * Proveedores soportados:
 * - 'gemini': Google Gemini (GRATIS)
 * - 'claude': Anthropic Claude (PAGADO)
 */

export type AIProvider = 'gemini' | 'claude'

/**
 * Obtiene el proveedor de IA configurado desde las variables de entorno
 */
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase()

  // Si no está configurado, usar Gemini por defecto (gratis)
  if (!provider) {
    return 'gemini'
  }

  // Validar que sea un proveedor válido
  if (provider !== 'gemini' && provider !== 'claude') {
    console.warn(`Proveedor de IA inválido: ${provider}. Usando Gemini por defecto.`)
    return 'gemini'
  }

  return provider as AIProvider
}

/**
 * Verifica que la API key necesaria esté configurada
 */
export function validateAIConfig(): { valid: boolean; provider: AIProvider; error?: string } {
  const provider = getAIProvider()

  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return {
        valid: false,
        provider,
        error: 'GEMINI_API_KEY no está configurada. Obtén una gratis en: https://makersuite.google.com/app/apikey'
      }
    }
  } else if (provider === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return {
        valid: false,
        provider,
        error: 'ANTHROPIC_API_KEY no está configurada. Obtén una en: https://console.anthropic.com/'
      }
    }
  }

  return { valid: true, provider }
}
