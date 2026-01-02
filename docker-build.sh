#!/bin/bash

# Script para hacer build de Docker con las variables de entorno necesarias

echo "=== Build de Docker para Health Tracker ==="
echo ""

# Cargar variables desde .env.production
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production no encontrado"
    exit 1
fi

# Extraer NEXT_PUBLIC_RECAPTCHA_SITE_KEY desde .env.production
RECAPTCHA_SITE_KEY=$(grep NEXT_PUBLIC_RECAPTCHA_SITE_KEY .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$RECAPTCHA_SITE_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_RECAPTCHA_SITE_KEY no encontrada en .env.production"
    exit 1
fi

echo "✓ Variables cargadas:"
echo "  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${RECAPTCHA_SITE_KEY:0:20}..."
echo ""

# Hacer el build
echo "Construyendo imagen Docker..."
docker build \
  --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$RECAPTCHA_SITE_KEY" \
  -t health-tracker:latest \
  .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completado exitosamente"
    echo ""
    echo "Para ejecutar el contenedor:"
    echo "  docker-compose up -d"
    echo ""
    echo "O manualmente:"
    echo "  docker run -d --name health-tracker --env-file .env.production -p 3000:3000 health-tracker:latest"
else
    echo ""
    echo "❌ Error en el build"
    exit 1
fi
