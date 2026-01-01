#!/bin/sh
set -e

echo "🔍 Esperando a que PostgreSQL esté listo..."

# Esperar a que PostgreSQL esté disponible
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "⏳ PostgreSQL no está listo - esperando..."
  sleep 2
done

echo "✅ PostgreSQL está listo!"

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "✅ Migraciones completadas!"

echo "🚀 Iniciando aplicación Next.js..."
exec npm start
