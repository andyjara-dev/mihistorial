#!/bin/bash

# Script de backup SEGURO para Health Tracker
# Uso: ./backup.sh [GPG_RECIPIENT_EMAIL]
# Ejemplo: ./backup.sh admin@example.com

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="health-tracker-db"
DB_NAME="health_tracker"
DB_USER="healthtracker"

# Email del recipiente GPG (debe estar configurado previamente)
GPG_RECIPIENT="${1:-}"

# Verificar que GPG esté instalado
if ! command -v gpg &> /dev/null; then
    echo -e "${RED}❌ ERROR: GPG no está instalado.${NC}"
    echo "Instala GPG primero: sudo apt-get install gnupg"
    exit 1
fi

# Si se proporcionó un recipiente GPG, verificar que exista
if [ -n "$GPG_RECIPIENT" ]; then
    if ! gpg --list-keys "$GPG_RECIPIENT" &> /dev/null; then
        echo -e "${RED}❌ ERROR: No se encontró la clave GPG para $GPG_RECIPIENT${NC}"
        echo "Importa la clave pública primero o genera una nueva:"
        echo "  gpg --gen-key"
        exit 1
    fi
    echo -e "${GREEN}✅ Usando encriptación GPG con: $GPG_RECIPIENT${NC}"
else
    echo -e "${YELLOW}⚠️  ADVERTENCIA: No se especificó recipiente GPG.${NC}"
    echo "Los backups NO estarán encriptados."
    echo "Uso recomendado: ./backup.sh admin@example.com"
    echo ""
    read -p "¿Continuar sin encriptación? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}📦 Iniciando backup SEGURO de Health Tracker...${NC}"

# Backup de base de datos (ENCRIPTADO)
echo -e "${YELLOW}💾 Creando backup de PostgreSQL...${NC}"
if [ -n "$GPG_RECIPIENT" ]; then
    docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip | gpg --encrypt --recipient "$GPG_RECIPIENT" > "$BACKUP_DIR/db_backup_$DATE.sql.gz.gpg"
    echo -e "${GREEN}   ✓ Base de datos encriptada con GPG${NC}"
else
    docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"
    echo -e "${YELLOW}   ⚠ Base de datos SIN encriptar${NC}"
fi

# Backup de archivos subidos (uploads) - ENCRIPTADO
echo -e "${YELLOW}📁 Creando backup de archivos...${NC}"
if [ -n "$GPG_RECIPIENT" ]; then
    docker run --rm \
      -v health-tracker_uploads_data:/data \
      -v $(pwd)/$BACKUP_DIR:/backup \
      alpine sh -c "tar cz -C /data ." | gpg --encrypt --recipient "$GPG_RECIPIENT" > "$BACKUP_DIR/uploads_backup_$DATE.tar.gz.gpg"
    echo -e "${GREEN}   ✓ Archivos encriptados con GPG${NC}"
else
    docker run --rm \
      -v health-tracker_uploads_data:/data \
      -v $(pwd)/$BACKUP_DIR:/backup \
      alpine tar czf /backup/uploads_backup_$DATE.tar.gz -C /data .
    echo -e "${YELLOW}   ⚠ Archivos SIN encriptar${NC}"
fi

# ⚠️ NO hacer backup del .env (contiene MASTER_ENCRYPTION_KEY y secretos)
echo -e "${YELLOW}🔐 Variables de entorno NO se incluyen por seguridad${NC}"
echo -e "   ${RED}⚠️  IMPORTANTE: Guarda MASTER_ENCRYPTION_KEY en un lugar seguro${NC}"
echo -e "   (usar secrets manager como AWS Secrets Manager o HashiCorp Vault)"


# Tamaño de backups
if [ -n "$GPG_RECIPIENT" ]; then
    DB_SIZE=$(du -h "$BACKUP_DIR/db_backup_$DATE.sql.gz.gpg" 2>/dev/null | cut -f1 || echo "N/A")
    UPLOADS_SIZE=$(du -h "$BACKUP_DIR/uploads_backup_$DATE.tar.gz.gpg" 2>/dev/null | cut -f1 || echo "N/A")
    EXTENSION=".gpg"
else
    DB_SIZE=$(du -h "$BACKUP_DIR/db_backup_$DATE.sql.gz" 2>/dev/null | cut -f1 || echo "N/A")
    UPLOADS_SIZE=$(du -h "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
    EXTENSION=""
fi

echo ""
echo -e "${GREEN}✅ Backup completado!${NC}"
echo ""
echo "Archivos creados:"
echo "  - Base de datos: db_backup_$DATE.sql.gz$EXTENSION ($DB_SIZE)"
echo "  - Archivos: uploads_backup_$DATE.tar.gz$EXTENSION ($UPLOADS_SIZE)"
echo ""
echo "Ubicación: $BACKUP_DIR/"
echo ""

if [ -n "$GPG_RECIPIENT" ]; then
    echo -e "${GREEN}🔐 Backups encriptados con GPG${NC}"
    echo ""
    echo "Para restaurar, primero desencripta:"
    echo "  gpg --decrypt $BACKUP_DIR/db_backup_$DATE.sql.gz.gpg | gunzip | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME"
    echo ""
fi

# Limpiar backups antiguos (mantener últimos 7 días)
echo -e "${YELLOW}🧹 Limpiando backups antiguos (>7 días)...${NC}"
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.gpg" -mtime +7 -delete

echo -e "${GREEN}✅ Proceso completado!${NC}"
echo ""
echo -e "${YELLOW}📝 Recordatorios de seguridad:${NC}"
echo "  1. Guarda MASTER_ENCRYPTION_KEY en un secrets manager"
echo "  2. Los backups encriptados requieren tu clave privada GPG para restaurar"
echo "  3. Haz backup de tu clave privada GPG: gpg --export-secret-keys > gpg-private.key"
echo "  4. Guarda la clave privada GPG en un lugar MUY seguro (offline preferiblemente)"
