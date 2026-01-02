#!/bin/sh
set -e

echo "🔍 Verificando conexión a PostgreSQL..."
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

# Función para verificar la conexión
check_postgres() {
  npx prisma db execute --stdin <<EOF 2>&1
SELECT 1;
EOF
}

# Esperar a que PostgreSQL esté disponible (máximo 30 intentos = 1 minuto)
MAX_RETRIES=30
RETRY_COUNT=0

until check_postgres || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Intento $RETRY_COUNT/$MAX_RETRIES - PostgreSQL no está listo..."

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Error: No se pudo conectar a PostgreSQL después de $MAX_RETRIES intentos"
    echo "Verificando configuración..."
    echo "DATABASE_URL está configurada: $([ -n "$DATABASE_URL" ] && echo "SÍ" || echo "NO")"
    echo ""
    echo "Intentando ejecutar migraciones de todas formas (pueden fallar)..."
  fi

  sleep 2
done

if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
  echo "✅ PostgreSQL está listo!"
fi

echo "🔄 Ejecutando migraciones de Prisma..."
if npx prisma migrate deploy; then
  echo "✅ Migraciones completadas!"
else
  echo "⚠️ Advertencia: Las migraciones fallaron o ya están aplicadas"
  echo "Continuando con el inicio de la aplicación..."
fi

echo "🚀 Iniciando aplicación Next.js..."
exec npm start
