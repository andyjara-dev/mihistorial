#!/bin/bash

# Script de setup inicial para VPS
# Este script configura todo lo necesario en un VPS limpio
# Uso: curl -fsSL https://raw.githubusercontent.com/TU_REPO/setup-vps.sh | bash
# O: ./setup-vps.sh

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Health Tracker - VPS Setup Script   ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que se ejecuta en Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}❌ Este script solo funciona en Linux${NC}"
    exit 1
fi

# Verificar si se ejecuta como root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No ejecutes este script como root${NC}"
    echo "Ejecútalo como usuario normal, pedirá sudo cuando sea necesario"
    exit 1
fi

echo -e "${YELLOW}🔍 Verificando sistema...${NC}"

# Actualizar sistema
echo -e "${YELLOW}📦 Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
sudo apt install -y curl git wget nano ufw

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker instalado${NC}"
else
    echo -e "${GREEN}✅ Docker ya está instalado${NC}"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}🐳 Instalando Docker Compose...${NC}"
    sudo apt install -y docker-compose
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
else
    echo -e "${GREEN}✅ Docker Compose ya está instalado${NC}"
fi

# Configurar Firewall
echo -e "${YELLOW}🔒 Configurando firewall...${NC}"
sudo ufw --force enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
echo -e "${GREEN}✅ Firewall configurado${NC}"

# Preguntar si clonar el repositorio
echo ""
read -p "¿Clonar repositorio de GitHub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "URL del repositorio: " REPO_URL
    echo -e "${YELLOW}📥 Clonando repositorio...${NC}"
    git clone $REPO_URL health-tracker
    cd health-tracker
else
    echo -e "${YELLOW}ℹ️  Asume que ya estás en el directorio del proyecto${NC}"
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ No se encontró docker-compose.yml${NC}"
    echo "Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Configurar .env
echo -e "${YELLOW}⚙️  Configurando variables de entorno...${NC}"

if [ -f ".env" ]; then
    read -p ".env ya existe. ¿Sobrescribir? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}ℹ️  Usando .env existente${NC}"
    else
        cp .env.production .env
    fi
else
    cp .env.production .env
fi

# Generar claves
echo -e "${YELLOW}🔑 Generando claves de seguridad...${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
MASTER_ENCRYPTION_KEY=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)

# Reemplazar en .env
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
sed -i "s|MASTER_ENCRYPTION_KEY=.*|MASTER_ENCRYPTION_KEY=$MASTER_ENCRYPTION_KEY|" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env

echo -e "${GREEN}✅ Claves generadas y guardadas en .env${NC}"

# Preguntar por dominio
echo ""
read -p "¿Tienes un dominio? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Ingresa tu dominio (ej: ejemplo.com): " DOMAIN
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|" .env

    echo -e "${YELLOW}🔒 ¿Deseas configurar SSL con Let's Encrypt? (y/N): ${NC}"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt install -y certbot
        sudo systemctl stop nginx 2>/dev/null || true
        docker-compose down 2>/dev/null || true

        echo -e "${YELLOW}📜 Obteniendo certificado SSL...${NC}"
        sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

        mkdir -p ssl
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
        sudo chown $USER:$USER ssl/*.pem

        echo -e "${GREEN}✅ SSL configurado${NC}"
    fi
else
    # Sin dominio, usar IP
    IP=$(curl -s ifconfig.me)
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$IP:3000|" .env
    echo -e "${YELLOW}ℹ️  La app estará en: http://$IP:3000${NC}"

    # Usar compose simplificado
    echo -e "${YELLOW}ℹ️  Usando configuración sin Nginx${NC}"
    COMPOSE_FILE="-f docker-compose.simple.yml"
fi

# Preguntar por Claude API
echo ""
read -p "¿Tienes Claude API key? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Ingresa tu Claude API key: " CLAUDE_KEY
    sed -i "s|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$CLAUDE_KEY|" .env
fi

# Dar permisos a scripts
chmod +x deploy.sh backup.sh 2>/dev/null || true

# Desplegar
echo ""
echo -e "${YELLOW}🚀 ¿Desplegar ahora? (y/N): ${NC}"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Desplegando Health Tracker...${NC}"
    docker-compose $COMPOSE_FILE build --no-cache
    docker-compose $COMPOSE_FILE up -d

    echo ""
    echo -e "${GREEN}✅ ¡Setup completado!${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}Health Tracker está corriendo!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""

    if [[ -n "$DOMAIN" ]]; then
        echo -e "Accede en: ${GREEN}https://$DOMAIN${NC}"
    else
        echo -e "Accede en: ${GREEN}http://$IP:3000${NC}"
    fi

    echo ""
    echo "Comandos útiles:"
    echo "  Ver logs:        docker-compose logs -f"
    echo "  Reiniciar:       docker-compose restart"
    echo "  Detener:         docker-compose down"
    echo "  Backup:          ./backup.sh"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda tu archivo .env en un lugar seguro${NC}"
    echo ""

    # Mostrar estado
    docker-compose ps
else
    echo ""
    echo -e "${GREEN}✅ Setup completado (sin desplegar)${NC}"
    echo ""
    echo "Para desplegar manualmente:"
    echo "  ./deploy.sh"
    echo ""
fi

# Configurar backups automáticos
echo ""
read -p "¿Configurar backups automáticos diarios? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CRON_JOB="0 3 * * * cd $(pwd) && ./backup.sh >> /var/log/health-tracker-backup.log 2>&1"
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Backups automáticos configurados (diario a las 3 AM)${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗"
echo -e "║         Setup completado! 🎉           ║"
echo -e "╚════════════════════════════════════════╝${NC}"
echo ""

# Si se agregó al grupo docker, recordar reiniciar sesión
if groups $USER | grep -q docker; then
    if [ -z "$DOCKER_WAS_INSTALLED" ]; then
        echo -e "${YELLOW}⚠️  Para que los cambios surtan efecto, cierra y vuelve a abrir tu sesión SSH${NC}"
        echo "O ejecuta: newgrp docker"
    fi
fi
