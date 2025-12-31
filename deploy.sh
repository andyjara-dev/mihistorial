#!/bin/bash

# Script de deployment para VPS con Docker
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deployment de Health Tracker..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que existe .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: No existe archivo .env${NC}"
    echo "Copia .env.production a .env y configura los valores"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está instalado${NC}"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose no está instalado${NC}"
    exit 1
fi

# Detener contenedores existentes
echo -e "${YELLOW}⏸️  Deteniendo contenedores existentes...${NC}"
docker-compose down

# Limpiar imágenes antiguas (opcional)
read -p "¿Limpiar imágenes antiguas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Limpiando imágenes antiguas...${NC}"
    docker image prune -f
fi

# Build de nuevas imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes...${NC}"
docker-compose build --no-cache

# Iniciar contenedores
echo -e "${YELLOW}🚀 Iniciando contenedores...${NC}"
docker-compose up -d

# Esperar a que la base de datos esté lista
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# Ver logs
echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""
echo "Ver logs en tiempo real:"
echo "  docker-compose logs -f"
echo ""
echo "Estado de contenedores:"
docker-compose ps
echo ""
echo -e "${GREEN}🎉 Health Tracker está corriendo!${NC}"
