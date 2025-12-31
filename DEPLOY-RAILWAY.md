# 🚂 Deploy a Railway en 5 Minutos

La forma **más rápida** de publicar tu Health Tracker.

## ✅ Por qué Railway

- ✨ PostgreSQL incluido (no necesitas configurar nada)
- 🚀 Deploy automático desde GitHub
- 💰 Plan gratuito generoso ($5/mes después)
- 🔧 Cero configuración de infraestructura

## 📋 Requisitos Previos

- Cuenta de GitHub
- Tu código en un repositorio de GitHub

---

## 🚀 Pasos (5 minutos)

### 1. Subir código a GitHub

```bash
# Desde la carpeta health-tracker
git init
git add .
git commit -m "Initial commit"

# Crea un repo en GitHub (https://github.com/new)
# Luego:
git remote add origin https://github.com/TU_USUARIO/health-tracker.git
git branch -M main
git push -u origin main
```

### 2. Crear cuenta en Railway

1. Ve a [https://railway.app](https://railway.app)
2. Click en "Login" → "Login with GitHub"
3. Autoriza Railway

### 3. Crear nuevo proyecto

1. Click "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona `health-tracker`
4. Railway detectará automáticamente que es Next.js

### 4. Agregar PostgreSQL

1. En el dashboard del proyecto, click "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará la base de datos automáticamente
4. Railway configurará `DATABASE_URL` automáticamente ✅

### 5. Configurar variables de entorno

En el servicio de Next.js (no en PostgreSQL):

1. Click en tu servicio Next.js
2. Ve a "Variables"
3. Click "+ New Variable"
4. Agrega cada una de estas:

**Genera las claves primero:**
```bash
# En tu terminal local:
openssl rand -base64 32  # Copia para NEXTAUTH_SECRET
openssl rand -base64 32  # Copia para MASTER_ENCRYPTION_KEY
```

**Variables a configurar:**

```bash
NEXTAUTH_SECRET=
# Pega la primera clave generada

NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
# Así tal cual, Railway lo reemplaza automáticamente

MASTER_ENCRYPTION_KEY=
# Pega la segunda clave generada

ANTHROPIC_API_KEY=sk-ant-api...
# Opcional, solo si tienes Claude API
```

### 6. Configurar Build Command

1. En tu servicio Next.js → "Settings"
2. Busca "Build Command"
3. Cambia a:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

4. En "Start Command" (debería estar así por defecto):
```bash
npm start
```

### 7. Deploy!

1. Click "Deploy" o simplemente espera
2. Railway compilará y desplegará automáticamente
3. Toma ~2-3 minutos

### 8. Ver tu app

1. En el dashboard, ve a "Settings" → "Networking"
2. Click en "Generate Domain"
3. Railway generará una URL pública
4. Copia la URL (ejemplo: `health-tracker-production.up.railway.app`)
5. **Importante**: Actualiza la variable `NEXTAUTH_URL`:
   - Si usaste `${{RAILWAY_PUBLIC_DOMAIN}}`, no necesitas hacer nada
   - Si pusiste una URL manual, actualízala con la URL real

---

## ✅ Verificar que funciona

1. Abre tu URL de Railway
2. Regístrate con un email
3. Inicia sesión
4. Sube un examen de prueba

**¡Listo!** Tu app está en producción 🎉

---

## 🔍 Ver logs y debugging

Si algo falla:

1. En Railway, ve a tu servicio Next.js
2. Click en "Deployments"
3. Click en el deployment actual
4. Ve a "View Logs"

Los errores más comunes:
- `NEXTAUTH_SECRET not set` → Agrega la variable
- `Can't connect to database` → Verifica que PostgreSQL esté corriendo
- `Build failed` → Revisa los logs de build

---

## 💰 Costos

Railway ofrece:
- **$5 de crédito gratis** cada mes
- Después: ~$5-10/mes dependiendo del uso
- Incluye PostgreSQL en el precio

**Para desarrollo/uso personal**: Generalmente te alcanza con el plan gratuito.

---

## 🔧 Actualizar tu app

Cuando hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Railway detectará el push y **desplegará automáticamente** 🚀

---

## 🌐 Dominio personalizado (opcional)

¿Quieres usar `miapp.com` en vez de `miapp.up.railway.app`?

1. En Railway → Settings → Networking
2. Click "Custom Domain"
3. Agrega tu dominio
4. Configura los DNS según las instrucciones
5. **Actualiza** `NEXTAUTH_URL` con tu nuevo dominio

---

## ⚠️ Importante: Backups

Railway NO hace backups automáticos de PostgreSQL en el plan gratuito.

**Para producción seria**, configura backups:
1. Railway Settings → PostgreSQL → Backups
2. O exporta manualmente: `pg_dump` periódicamente

---

## 🎯 Próximos pasos

Después del deploy:

- [ ] Prueba todas las funcionalidades
- [ ] Configura un dominio personalizado
- [ ] Invita a usuarios de prueba
- [ ] Monitorea los logs regularmente
- [ ] Configura backups de base de datos

---

## 🆘 Ayuda

**Problema**: La app se desplegó pero no carga

**Solución**:
1. Verifica que `NEXTAUTH_URL` sea correcto
2. Revisa los logs en Railway
3. Verifica que todas las variables estén configuradas

**Problema**: Error al subir archivos

**Solución**: Railway usa almacenamiento efímero. Los archivos se perderán al redesplegar. Para producción, necesitas:
- Vercel Blob Storage
- AWS S3
- Cloudinary

**Más ayuda**: [Railway Docs](https://docs.railway.app) o [Discord de Railway](https://discord.gg/railway)

---

¡Felicidades! Tu Health Tracker está en producción 🎊
