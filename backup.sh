#!/bin/bash

# Script de backup para Health Tracker
# Uso: ./backup.sh

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="health-tracker-db"
DB_NAME="health_tracker"
DB_USER="healthtracker"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}📦 Iniciando backup de Health Tracker...${NC}"

# Backup de base de datos
echo -e "${YELLOW}💾 Creando backup de PostgreSQL...${NC}"
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup de archivos subidos (uploads)
echo -e "${YELLOW}📁 Creando backup de archivos...${NC}"
docker run --rm \
  -v health-tracker_uploads_data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/uploads_backup_$DATE.tar.gz -C /data .

# Backup de variables de entorno (sin valores sensibles)
echo -e "${YELLOW}⚙️  Creando backup de configuración...${NC}"
cp .env "$BACKUP_DIR/env_backup_$DATE.txt"

# Tamaño de backups
DB_SIZE=$(du -h "$BACKUP_DIR/db_backup_$DATE.sql.gz" | cut -f1)
UPLOADS_SIZE=$(du -h "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}✅ Backup completado!${NC}"
echo ""
echo "Archivos creados:"
echo "  - Base de datos: db_backup_$DATE.sql.gz ($DB_SIZE)"
echo "  - Archivos: uploads_backup_$DATE.tar.gz ($UPLOADS_SIZE)"
echo "  - Config: env_backup_$DATE.txt"
echo ""
echo "Ubicación: $BACKUP_DIR/"
echo ""

# Limpiar backups antiguos (mantener últimos 7 días)
echo -e "${YELLOW}🧹 Limpiando backups antiguos (>7 días)...${NC}"
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.txt" -mtime +7 -delete

echo -e "${GREEN}✅ Proceso completado!${NC}"
