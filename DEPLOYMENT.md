# Guía de Deployment - Health Tracker

Esta guía te ayudará a publicar tu aplicación Health Tracker en producción.

## ⚠️ IMPORTANTE: Seguridad en Producción

Antes de publicar, **DEBES** regenerar las claves secretas:

```bash
# Genera nuevas claves para producción
openssl rand -base64 32  # Para NEXTAUTH_SECRET
openssl rand -base64 32  # Para MASTER_ENCRYPTION_KEY
```

**NO uses las claves de desarrollo en producción.**

---

## 🚀 Opción 1: Vercel + Neon PostgreSQL (Recomendado)

**Ventajas**: Gratis, rápido, perfecto para Next.js
**Tiempo**: ~10 minutos

### Paso 1: Crear cuenta en Neon (Base de datos)

1. Ve a [https://neon.tech](https://neon.tech)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Copia el `DATABASE_URL` (Connection String)
   - Ejemplo: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Paso 2: Preparar repositorio GitHub

```bash
# Si no has iniciado git
git init
git add .
git commit -m "Initial commit - Health Tracker"

# Crear repo en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/health-tracker.git
git branch -M main
git push -u origin main
```

### Paso 3: Desplegar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las siguientes variables de entorno:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb
NEXTAUTH_SECRET=tu-nueva-clave-generada-con-openssl
NEXTAUTH_URL=https://tu-app.vercel.app
MASTER_ENCRYPTION_KEY=tu-otra-clave-generada-con-openssl
ANTHROPIC_API_KEY=sk-ant-api... (opcional)
```

5. En "Build & Development Settings":
   - **Build Command**: `npx prisma generate && npx prisma migrate deploy && next build`
   - **Install Command**: `npm install`

6. Click "Deploy"

### Paso 4: Ejecutar migraciones

Después del primer deploy:

```bash
# Localmente, apuntando a la BD de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

O agrega un script de migración automática (ver más abajo).

---

## 🚀 Opción 2: Railway (Más Fácil - Todo Incluido)

**Ventajas**: PostgreSQL incluido, cero configuración
**Costo**: $5/mes después de uso gratuito

### Pasos:

1. Ve a [https://railway.app](https://railway.app)
2. Conecta con GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Click "Add PostgreSQL" desde el dashboard
6. Railway creará automáticamente `DATABASE_URL`
7. Agrega estas variables de entorno en el servicio de Next.js:

```bash
NEXTAUTH_SECRET=tu-nueva-clave
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
MASTER_ENCRYPTION_KEY=tu-otra-clave
ANTHROPIC_API_KEY=sk-ant-... (opcional)
```

8. En Settings → Build:
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`

9. Deploy automático!

**Railway ejecutará las migraciones automáticamente.**

---

## 🚀 Opción 3: Render (Alternativa Gratuita)

**Ventajas**: Gratis con limitaciones
**Desventajas**: Más lento que Vercel

### Paso 1: Crear base de datos

1. Ve a [https://render.com](https://render.com)
2. New → PostgreSQL
3. Nombre: `health-tracker-db`
4. Plan: Free
5. Copia el `Internal Database URL`

### Paso 2: Crear Web Service

1. New → Web Service
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name**: `health-tracker`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm start`

4. Variables de entorno:

```bash
DATABASE_URL=postgresql://... (Internal Database URL)
NEXTAUTH_SECRET=tu-nueva-clave
NEXTAUTH_URL=https://health-tracker.onrender.com
MASTER_ENCRYPTION_KEY=tu-otra-clave
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-... (opcional)
```

5. Click "Create Web Service"

---

## 🔧 Configuración Adicional Necesaria

### 1. Agregar script de migración automática

Edita `package.json` y agrega:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

### 2. Crear archivo `.gitignore` completo

Asegúrate de que `.gitignore` incluya:

```
.env
.env.local
node_modules/
.next/
uploads/
*.log
.DS_Store
```

### 3. Configurar archivos subidos (uploads)

**Problema**: Los archivos subidos en Vercel/Railway se pierden al redesplegar.

**Soluciones**:

#### Opción A: Usar Vercel Blob Storage (Recomendado)

```bash
npm install @vercel/blob
```

#### Opción B: Usar AWS S3

```bash
npm install @aws-sdk/client-s3
```

#### Opción C: Usar Cloudinary

```bash
npm install cloudinary
```

**Para empezar**, el almacenamiento local funcionará, pero ten en cuenta que:
- Los archivos se pierden al redesplegar
- Solo funciona con un servidor (no funciona con serverless de Vercel)

**Recomendación**: Implementa almacenamiento en la nube para producción.

---

## ✅ Checklist Pre-Producción

Antes de publicar, verifica:

- [ ] Regeneraste `NEXTAUTH_SECRET` con `openssl rand -base64 32`
- [ ] Regeneraste `MASTER_ENCRYPTION_KEY` con `openssl rand -base64 32`
- [ ] Configuraste correctamente `NEXTAUTH_URL` (debe ser la URL de producción)
- [ ] Agregaste `DATABASE_URL` de tu base de datos en producción
- [ ] El archivo `.env` NO está en git (verifica `.gitignore`)
- [ ] Agregaste `ANTHROPIC_API_KEY` si quieres procesamiento de IA
- [ ] Probaste el registro de usuarios
- [ ] Probaste la subida de archivos

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"

**Causa**: `DATABASE_URL` incorrecta o red bloqueada

**Solución**:
- Verifica que la `DATABASE_URL` sea correcta
- En Neon, asegúrate de usar la URL con SSL: `?sslmode=require`

### Error: "NEXTAUTH_SECRET not set"

**Solución**: Agrega la variable de entorno en tu plataforma de deployment

### Error: "Prisma Client not generated"

**Solución**: Agrega `npx prisma generate` al build command

### Los archivos subidos desaparecen

**Causa**: Vercel usa serverless functions, no hay almacenamiento persistente

**Solución**: Implementa almacenamiento en la nube (S3, Vercel Blob, Cloudinary)

### Error 500 en producción

**Solución**:
1. Revisa los logs en tu plataforma (Vercel/Railway/Render)
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las migraciones se ejecutaron

---

## 📊 Monitoreo y Logs

### Vercel
- Dashboard → Tu Proyecto → Logs
- Runtime Logs muestran errores en tiempo real

### Railway
- Proyecto → Service → Logs
- Actualización en tiempo real

### Render
- Dashboard → Web Service → Logs

---

## 🔒 Mejoras de Seguridad Post-Deployment

1. **Rate Limiting**: Implementa límites de requests
2. **CORS**: Configura políticas de CORS adecuadas
3. **HTTPS**: Todas las plataformas incluyen SSL automático
4. **Backups**: Configura backups automáticos de tu BD
5. **Monitoreo**: Usa servicios como Sentry para errores

---

## 💰 Costos Estimados

### Opción Gratis Total:
- **Vercel**: Gratis (hasta 100GB bandwidth/mes)
- **Neon**: Gratis (hasta 0.5GB storage)
- **Total**: $0/mes

### Opción Railway:
- **Railway**: $5/mes (incluye todo)
- **Total**: $5/mes

### Opción Render:
- **Render Free**: $0/mes (con limitaciones de sleep)
- **Render Paid**: $7/mes + $7/mes DB
- **Total**: $14/mes

---

## 🎯 Recomendación Final

**Para empezar**: Usa **Vercel + Neon** (gratis, rápido, fácil)

**Para escalar**: Usa **Railway** ($5/mes, todo incluido, sin complicaciones)

**Para control total**: Usa **VPS** (DigitalOcean, AWS, etc.)

---

## 📞 Próximos Pasos

Después de desplegar:

1. Regístrate en tu app de producción
2. Sube un examen de prueba
3. Verifica que la encriptación funcione
4. Configura un dominio personalizado (opcional)
5. Comparte tu app!

**¿Problemas?** Revisa los logs de tu plataforma o consulta la documentación oficial.
