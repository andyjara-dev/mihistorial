# Deployment con Docker - Health Tracker

Esta guía te ayudará a desplegar Health Tracker en producción usando Docker.

---

## 📋 Pre-requisitos

1. Docker y Docker Compose instalados
2. Archivo `.env.production` configurado con todas las variables necesarias
3. Base de datos PostgreSQL accesible

---

## 🚀 Método 1: Usando el script de build (Recomendado)

El script `docker-build.sh` hace todo automáticamente:

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x docker-build.sh

# Ejecutar el build
./docker-build.sh
```

El script:
- ✅ Lee `.env.production` automáticamente
- ✅ Extrae `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- ✅ Hace el build con las variables correctas
- ✅ Muestra instrucciones para ejecutar

---

## 🚀 Método 2: Usando Docker Compose

### Paso 1: Cargar variables de entorno

Antes de ejecutar docker-compose, carga las variables en tu shell:

```bash
# En Linux/Mac
export $(grep NEXT_PUBLIC_RECAPTCHA_SITE_KEY .env.production | xargs)

# Verificar que se cargó
echo $NEXT_PUBLIC_RECAPTCHA_SITE_KEY
```

### Paso 2: Build y ejecución

```bash
# Build y ejecutar
docker-compose up -d --build

# Ver logs
docker-compose logs -f app
```

---

## 🚀 Método 3: Build manual con Docker

Si prefieres hacer el build manualmente:

```bash
# 1. Extraer la variable
RECAPTCHA_KEY=$(grep NEXT_PUBLIC_RECAPTCHA_SITE_KEY .env.production | cut -d '=' -f2 | tr -d '"')

# 2. Build de la imagen
docker build \
  --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$RECAPTCHA_KEY" \
  -t health-tracker:latest \
  .

# 3. Ejecutar el contenedor
docker run -d \
  --name health-tracker \
  --env-file .env.production \
  -p 3000:3000 \
  health-tracker:latest
```

---

## 🔍 Verificar que funciona

### 1. Verificar que el contenedor está corriendo

```bash
docker ps | grep health-tracker
```

### 2. Ver logs

```bash
# Docker Compose
docker-compose logs -f app

# Docker directo
docker logs -f health-tracker
```

### 3. Verificar variables de entorno

```bash
# Ejecutar el script de diagnóstico
./check-production.sh

# O manualmente
docker exec health-tracker printenv | grep NEXT_PUBLIC
```

Deberías ver:
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAc...
```

### 4. Probar en el navegador

1. Abre `http://mihistorial.cloud` (o tu dominio)
2. Abre la consola del navegador (F12)
3. NO deberías ver el error: `Missing required parameters: sitekey`
4. Intenta registrarte - el reCAPTCHA debe funcionar

---

## ❌ Solución de Problemas

### Error: "Missing required parameters: sitekey"

**Causa:** La variable `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` no se pasó durante el build.

**Solución:**
```bash
# 1. Detener y eliminar contenedor actual
docker-compose down
# o
docker stop health-tracker && docker rm health-tracker

# 2. Hacer rebuild con el script
./docker-build.sh

# 3. Volver a ejecutar
docker-compose up -d
```

### Error: "RESEND_API_KEY no está configurada"

**Causa:** Falta configurar Resend en `.env.production`

**Solución:**
1. Edita `.env.production`
2. Configura `RESEND_API_KEY` con tu clave real
3. Reinicia el contenedor:
```bash
docker-compose restart app
```

### La aplicación no inicia

**Verificar:**
```bash
# Ver logs completos
docker-compose logs app

# Verificar conexión a base de datos
docker exec health-tracker-app npx prisma db pull
```

### Migraciones no se aplican

```bash
# Ejecutar migraciones manualmente
docker exec health-tracker-app npx prisma migrate deploy

# Verificar estado
docker exec health-tracker-app npx prisma migrate status
```

---

## 🔄 Actualizar la aplicación

Cuando hagas cambios en el código:

```bash
# 1. Detener contenedor
docker-compose down

# 2. Rebuild
./docker-build.sh

# 3. Volver a ejecutar
docker-compose up -d

# 4. Ver logs
docker-compose logs -f app
```

---

## 📦 Variables de Entorno Críticas

Estas variables **DEBEN** estar en `.env.production`:

### Build Time (necesarias durante docker build)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAc..."  # Clave pública de reCAPTCHA
```

### Runtime (necesarias al ejecutar el contenedor)
```bash
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://mihistorial.cloud"

# Encriptación
MASTER_ENCRYPTION_KEY="..."

# IA
AI_PROVIDER="gemini"
GEMINI_API_KEY="..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="MiHistorial.Cloud <noreply@tudominio.com>"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAc..."  # También en runtime
RECAPTCHA_SECRET_KEY="6LeIxAc..."
```

---

## 🔐 Seguridad

### NO hacer:
- ❌ Subir `.env.production` a Git
- ❌ Compartir las claves secretas
- ❌ Usar las mismas claves en dev y producción

### SÍ hacer:
- ✅ Usar variables de entorno en el servidor
- ✅ Rotar claves periódicamente
- ✅ Mantener backups de `.env.production`
- ✅ Usar HTTPS en producción

---

## 📊 Monitoreo

```bash
# Ver uso de recursos
docker stats health-tracker-app

# Ver logs en tiempo real
docker-compose logs -f app

# Verificar salud del contenedor
docker inspect health-tracker-app | grep -i health
```

---

## 🎉 ¡Listo!

Tu aplicación Health Tracker debería estar corriendo en producción con:
- ✅ reCAPTCHA funcionando
- ✅ Verificación de email
- ✅ Validación de identidad de paciente
- ✅ Base de datos conectada
- ✅ Migraciones aplicadas

Si tienes problemas, revisa los logs o ejecuta `./check-production.sh`
