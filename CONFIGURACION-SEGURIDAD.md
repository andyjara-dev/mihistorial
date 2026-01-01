# 🔒 Configuración de Seguridad: reCAPTCHA y Verificación de Email

Esta guía te ayudará a configurar Google reCAPTCHA v2 y el sistema de verificación de email para tu instalación de Health Tracker.

---

## 📋 Índice

1. [Configurar Google reCAPTCHA v2](#1-configurar-google-recaptcha-v2)
2. [Configurar Resend para Email](#2-configurar-resend-para-envío-de-emails)
3. [Configurar Variables de Entorno](#3-configurar-variables-de-entorno)
4. [Probar la Configuración](#4-probar-la-configuración)
5. [Solución de Problemas](#5-solución-de-problemas)

---

## 1️⃣ Configurar Google reCAPTCHA v2

### Paso 1: Crear un sitio en Google reCAPTCHA

1. Ve a [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el botón **"+"** para crear un nuevo sitio

### Paso 2: Configurar el sitio

Completa el formulario con la siguiente información:

- **Etiqueta**: `Health Tracker - MiHistorial.Cloud` (o el nombre que prefieras)
- **Tipo de reCAPTCHA**: Selecciona **reCAPTCHA v2** → **Casilla de verificación "No soy un robot"**
- **Dominios**:
  - Para desarrollo local: `localhost`
  - Para producción: `tudominio.com` (sin http:// o https://)
  - Puedes agregar múltiples dominios
- **Acepta los términos de servicio**
- Haz clic en **Enviar**

### Paso 3: Obtener las claves

Después de crear el sitio, verás dos claves:

```
Site Key (Clave del sitio):    6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
Secret Key (Clave secreta):    6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

✅ **Importante:**
- La **Site Key** es pública y se usa en el cliente (navegador)
- La **Secret Key** es privada y NUNCA debe compartirse

---

## 2️⃣ Configurar Resend para Envío de Emails

### ¿Qué es Resend?

Resend es un servicio moderno para envío de emails transaccionales (como verificación de cuenta, recuperación de contraseña, etc.). Es gratis hasta 3,000 emails/mes.

### Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Haz clic en **Sign Up**
3. Crea tu cuenta (puedes usar GitHub/Google)

### Paso 2: Obtener API Key

1. Una vez dentro del dashboard, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre: `Health Tracker Production`
4. Selecciona los permisos: **Send emails**
5. Haz clic en **Add**
6. **Copia la clave** (la verás solo una vez): `re_123abc...`

### Paso 3: Verificar tu dominio (Producción)

Para producción necesitas verificar tu dominio:

1. Ve a **Domains** en Resend
2. Haz clic en **Add Domain**
3. Ingresa tu dominio: `tudominio.com`
4. Resend te dará registros DNS que debes agregar:
   - SPF
   - DKIM
   - DMARC

5. Agrega estos registros en tu proveedor de DNS (Cloudflare, Namecheap, etc.)
6. Espera a que se verifiquen (puede tomar hasta 24 horas)

### Paso 4: Email "From" permitido

Una vez verificado el dominio, puedes usar:
```
EMAIL_FROM="MiHistorial.Cloud <noreply@tudominio.com>"
```

**Para desarrollo/testing:**
Resend te da un dominio temporal: `onboarding@resend.dev`

---

## 3️⃣ Configurar Variables de Entorno

### Para Desarrollo Local

Edita tu archivo `.env`:

```bash
# ===== VERIFICACIÓN DE EMAIL =====
RESEND_API_KEY="re_TuApiKeyAqui"
EMAIL_FROM="MiHistorial.Cloud <onboarding@resend.dev>"

# ===== GOOGLE reCAPTCHA v2 =====
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
RECAPTCHA_SECRET_KEY="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
```

### Para Producción

Edita tu archivo `.env.production` o configura en tu plataforma de hosting:

```bash
# ===== VERIFICACIÓN DE EMAIL =====
RESEND_API_KEY="re_TuApiKeyProduccion"
EMAIL_FROM="MiHistorial.Cloud <noreply@tudominio.com>"

# ===== GOOGLE reCAPTCHA v2 =====
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="TuSiteKeyReal"
RECAPTCHA_SECRET_KEY="TuSecretKeyReal"
```

---

## 4️⃣ Probar la Configuración

### Paso 1: Reiniciar el servidor de desarrollo

```bash
npm run dev
```

### Paso 2: Probar el registro

1. Abre `http://localhost:3000/auth/signup`
2. Llena el formulario de registro
3. Haz clic en **Crear Cuenta**
4. Deberías ver el challenge de reCAPTCHA (o se ejecutará invisible)
5. Revisa tu bandeja de entrada del email que registraste

### Paso 3: Verificar el email

1. Abre el email que recibiste
2. Haz clic en **Verificar Email**
3. Deberías ser redirigido a una página de confirmación
4. Intenta iniciar sesión con tu cuenta

### ✅ Si todo funciona:

- El reCAPTCHA se ejecutó correctamente
- Recibiste el email de verificación
- Pudiste verificar tu email
- Puedes iniciar sesión

---

## 5️⃣ Solución de Problemas

### ❌ "Error al verificar reCAPTCHA"

**Causas comunes:**
- `RECAPTCHA_SECRET_KEY` no está configurada
- La Secret Key es incorrecta
- El dominio no está autorizado en Google reCAPTCHA

**Solución:**
1. Verifica que la Secret Key en `.env` sea correcta
2. En Google reCAPTCHA Admin, agrega `localhost` a la lista de dominios

### ❌ "Error al enviar email"

**Causas comunes:**
- `RESEND_API_KEY` no está configurada o es incorrecta
- El email "from" no está verificado (en producción)
- Límite de envíos alcanzado (3,000/mes en plan gratis)

**Solución:**
1. Verifica que `RESEND_API_KEY` en `.env` sea correcta
2. Revisa los logs de Resend: [resend.com/emails](https://resend.com/emails)
3. Para desarrollo, usa `onboarding@resend.dev`

### ❌ "Por favor verifica tu email antes de iniciar sesión"

**Esto es normal si:**
- Acabas de crear la cuenta pero no has verificado el email
- El token de verificación expiró (24 horas)

**Solución:**
- Revisa tu bandeja de entrada y spam
- Si no recibiste el email, revisa los logs del servidor

### ❌ El reCAPTCHA no aparece

**Causas comunes:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` no está configurada
- La clave es incorrecta
- El componente usa `size="invisible"` (es normal que no se vea)

**Solución:**
1. Verifica que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` esté en `.env`
2. Asegúrate de que la variable empiece con `NEXT_PUBLIC_`
3. Reinicia el servidor de desarrollo

---

## 📊 Monitoreo

### Verificar emails enviados

1. Ve a [resend.com/emails](https://resend.com/emails)
2. Verás todos los emails enviados con su estado:
   - ✅ **Delivered**: Entregado correctamente
   - ⏳ **Queued**: En cola
   - ❌ **Failed**: Falló (revisa el motivo)

### Verificar intentos de reCAPTCHA

1. Ve a [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Selecciona tu sitio
3. Ve a **Analytics** para ver estadísticas

---

## 🔐 Seguridad

### Mejores Prácticas

✅ **HACER:**
- Mantén las Secret Keys en secreto
- Usa variables de entorno, nunca hardcodees las claves
- Rota las API keys periódicamente
- Monitorea el uso de Resend
- Verifica tu dominio en producción

❌ **NO HACER:**
- Subir `.env` a GitHub
- Compartir las Secret Keys
- Usar la misma API key en desarrollo y producción
- Dejar reCAPTCHA deshabilitado en producción

---

## 📚 Referencias

- [Google reCAPTCHA Docs](https://developers.google.com/recaptcha/docs/display)
- [Resend Docs](https://resend.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🎉 ¡Listo!

Tu aplicación ahora tiene:
- ✅ Protección contra bots con reCAPTCHA
- ✅ Verificación de email obligatoria
- ✅ Sistema seguro de autenticación

Los usuarios ahora deben verificar su email antes de poder usar la aplicación, añadiendo una capa extra de seguridad.
