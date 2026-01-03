#!/bin/bash

echo "🚀 Actualizando Health Tracker en Producción"
echo "=============================================="

# 1. Detener contenedor actual
echo ""
echo "📦 Paso 1: Deteniendo contenedor actual..."
docker-compose down

# 2. Limpiar imagen vieja (forzar rebuild)
echo ""
echo "🧹 Paso 2: Eliminando imagen vieja para forzar rebuild..."
docker rmi health-tracker:latest 2>/dev/null || echo "No había imagen previa"

# 3. Rebuild de la imagen con build args
echo ""
echo "🔨 Paso 3: Construyendo nueva imagen con últimos cambios..."
RECAPTCHA_SITE_KEY=$(grep NEXT_PUBLIC_RECAPTCHA_SITE_KEY .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$RECAPTCHA_SITE_KEY" ]; then
  echo "❌ ERROR: No se encontró NEXT_PUBLIC_RECAPTCHA_SITE_KEY en .env.production"
  exit 1
fi

docker build \
  --no-cache \
  --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$RECAPTCHA_SITE_KEY" \
  -t health-tracker:latest \
  .

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Falló el build de Docker"
  exit 1
fi

# 4. Iniciar nuevo contenedor
echo ""
echo "🚀 Paso 4: Iniciando nuevo contenedor..."
docker-compose up -d

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Falló al iniciar el contenedor"
  exit 1
fi

# 5. Mostrar logs
echo ""
echo "📋 Paso 5: Mostrando logs (Ctrl+C para salir)..."
sleep 3
docker-compose logs -f health-tracker
