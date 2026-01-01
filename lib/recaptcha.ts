/**
 * Verifica el token de reCAPTCHA con Google
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY no está configurada')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (data.success) {
      return true
    } else {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return false
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return false
  }
}
