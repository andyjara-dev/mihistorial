# 🚀 Guía de Despliegue a Producción

## Pasos para Desplegar

### 1. Rebuild de la Imagen Docker

```bash
./docker-build.sh
```

Este script:
- Extrae `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` desde `.env.production`
- Construye la imagen con los build args correctos
- Crea la imagen `health-tracker:latest`

### 2. Detener el Contenedor Actual

```bash
docker-compose down
```

### 3. Iniciar el Nuevo Contenedor

```bash
docker-compose up -d
```

### 4. Verificar que Todo Funciona

```bash
# Ver logs en tiempo real
docker-compose logs -f health-tracker

# Deberías ver:
# ✅ Prisma Client generated
# ✅ Migrations applied
# ✅ Server listening on port 3000
```

### 5. Probar en el Navegador

1. Abre https://mihistorial.cloud
2. Verifica que:
   - ✅ El favicon aparece correctamente
   - ✅ El logo del header es más grande
   - ✅ Puedes subir un PDF
   - ✅ El dashboard se actualiza solo cuando termina el procesamiento

## 🧪 Probar el Merge Inteligente

1. **Primera carga:**
   - Sube un PDF de examen médico
   - Espera a que termine el procesamiento con IA
   - Anota cuántos resultados se extrajeron

2. **Segunda carga del mismo PDF:**
   - Sube el **mismo archivo PDF** otra vez
   - Deberías ver el mensaje: "📄 PDF duplicado detectado"
   - Espera a que termine el reprocesamiento
   - Verifica que:
     - ✅ Los resultados viejos se mantienen
     - ✅ Si la IA encuentra nuevos resultados, se agregan
     - ✅ No se duplican los resultados existentes

3. **Revisar logs del servidor:**
   ```bash
   docker-compose logs -f health-tracker | grep -E "(Merge|Agregando|Manteniendo)"
   ```

   Deberías ver:
   ```
   🔄 Merge completado: 5 datos viejos + 7 datos nuevos → 8 datos finales
   ⏭️  Manteniendo resultado existente: hemoglobina
   ➕ Agregando nuevo resultado: trigliceridos
   ```

## 🔄 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar solo el contenedor de la app
docker-compose restart health-tracker

# Ver estado de los contenedores
docker-compose ps

# Rebuild sin cache (si hay problemas)
./docker-build.sh --no-cache
docker-compose up -d --force-recreate
```

## ✅ Checklist de Verificación

Después del despliegue, verifica:

- [ ] Favicon personalizado aparece en el navegador
- [ ] Logo del header es más grande y legible
- [ ] Login funciona con reCAPTCHA
- [ ] Signup funciona con reCAPTCHA y verificación de email
- [ ] Puedes subir PDFs y se procesan con IA
- [ ] Dashboard se actualiza automáticamente cada 5 segundos cuando hay exámenes procesándose
- [ ] Al subir el mismo PDF dos veces aparece mensaje "PDF duplicado detectado"
- [ ] Los datos se mergean inteligentemente (verifica en logs)
- [ ] Puedes eliminar exámenes desde la página de detalle
- [ ] El modal de confirmación aparece antes de eliminar
- [ ] Después de eliminar, te redirige al dashboard

## 🐛 Solución de Problemas

### Error: "Missing required parameters: sitekey"
- Verifica que `.env.production` tiene `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Ejecuta `./docker-build.sh` (NO `docker build` directamente)

### Error: "Config file not found"
- Verifica que `prisma.config.mts` existe en el directorio raíz
- Rebuild con `./docker-build.sh`

### Favicon no aparece
- Verifica que los archivos están en `public/` (NO en `app/`)
- Limpia cache del navegador (Ctrl+Shift+R)
- Prueba en modo incógnito

### Dashboard no se actualiza solo
- Verifica en los logs que el examen está en estado "processing"
- El auto-refresh funciona solo cuando `processingStatus === 'processing'`
- Cuando cambia a "completed", para el refresh

### Merge no funciona
- Verifica en logs que dice "🔄 Merge completado"
- Asegúrate de subir exactamente el mismo archivo PDF
- El merge solo ocurre si `aiProcessed === true` en el examen anterior
