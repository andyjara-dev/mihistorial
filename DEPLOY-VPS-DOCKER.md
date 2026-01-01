# 🐳 Deployment con Docker en VPS

Guía completa para instalar Health Tracker en tu propio VPS usando Docker.

## 📋 Requisitos

- VPS con Ubuntu 20.04+ (también funciona con Debian, CentOS)
- Mínimo 1GB RAM, 1 CPU
- Docker y Docker Compose instalados
- Dominio apuntando a tu VPS (opcional pero recomendado)
- Acceso SSH al servidor

---

## 📊 ¿Cómo funciona la Base de Datos con Prisma?

Health Tracker usa **Prisma** como ORM (Object-Relational Mapping). Aquí está lo que necesitas saber:

### Base de Datos Incluida
- Docker Compose incluye un contenedor PostgreSQL listo para usar
- **No necesitas instalar PostgreSQL** en tu servidor
- La base de datos se crea automáticamente al ejecutar `docker-compose up`

### Migraciones Automáticas
Cuando el contenedor de la aplicación arranca:

1. ✅ **Espera** a que PostgreSQL esté disponible
2. ✅ **Ejecuta automáticamente** `prisma migrate deploy`
3. ✅ **Crea todas las tablas** necesarias (User, MedicalExam, Document, etc.)
4. ✅ **Inicia la aplicación**

**Esto significa que NO necesitas:**
- Ejecutar comandos SQL manualmente
- Crear tablas a mano
- Preocuparte por el schema de la base de datos

Todo se configura automáticamente. 🎉

### ¿Qué pasa si quieres usar tu propia Base de Datos?

Si ya tienes PostgreSQL corriendo en otro servidor:
1. Cambia `DATABASE_URL` en el `.env` para apuntar a tu servidor
2. Las migraciones se ejecutarán automáticamente en tu BD
3. Listo, no hay pasos adicionales

Ver la sección **"Cambiar a una base de datos diferente"** más abajo para detalles.

---

## 🚀 Instalación Rápida (5 pasos)

### 1. Instalar Docker en el VPS

Conecta a tu VPS por SSH:

```bash
ssh usuario@tu-vps-ip
```

Instala Docker:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version

# Reiniciar sesión para aplicar cambios de grupo
exit
ssh usuario@tu-vps-ip
```

### 2. Clonar/Subir el proyecto al VPS

**Opción A: Desde GitHub (recomendado)**

```bash
# Si el proyecto está en GitHub
git clone https://github.com/TU_USUARIO/health-tracker.git
cd health-tracker
```

**Opción B: Subir archivos manualmente**

Desde tu máquina local:

```bash
# Comprimir el proyecto
cd health-tracker
tar -czf health-tracker.tar.gz .

# Subir al VPS
scp health-tracker.tar.gz usuario@tu-vps-ip:~

# En el VPS
ssh usuario@tu-vps-ip
mkdir health-tracker
cd health-tracker
tar -xzf ../health-tracker.tar.gz
```

### 3. Configurar variables de entorno

```bash
# Copiar template
cp .env.production .env

# Generar claves seguras
openssl rand -base64 32  # Copia para NEXTAUTH_SECRET
openssl rand -base64 32  # Copia para MASTER_ENCRYPTION_KEY
openssl rand -base64 32  # Copia para DB_PASSWORD

# Editar .env
nano .env
```

Configura estos valores en `.env`:

```bash
# PostgreSQL
DB_PASSWORD=la-clave-generada-para-db

# NextAuth.js
NEXTAUTH_SECRET=la-primera-clave-generada
NEXTAUTH_URL=https://tu-dominio.com  # O http://tu-ip:3000

# Encriptación
MASTER_ENCRYPTION_KEY=la-segunda-clave-generada

# Claude API (opcional)
ANTHROPIC_API_KEY=sk-ant-api...
```

### 4. Desplegar con Docker

```bash
# Dar permisos de ejecución a los scripts
chmod +x deploy.sh
chmod +x docker-entrypoint.sh

# Ejecutar deployment
./deploy.sh
```

O manualmente:

```bash
# Build y arrancar contenedores
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

**⚡ Importante sobre la Base de Datos:**

Cuando el contenedor arranca por primera vez, el script `docker-entrypoint.sh` ejecuta automáticamente:

1. **Verifica** que PostgreSQL esté disponible
2. **Ejecuta** las migraciones de Prisma (`prisma migrate deploy`)
3. **Crea** todas las tablas necesarias en tu base de datos de producción
4. **Inicia** la aplicación Next.js

Esto significa que **NO necesitas ejecutar comandos de Prisma manualmente**. Todo se configura automáticamente cuando despliegas.

Para verificar que las migraciones se ejecutaron correctamente:

```bash
# Ver los logs del contenedor app durante el inicio
docker-compose logs app | grep -i prisma

# Deberías ver mensajes como:
# ✅ PostgreSQL está listo!
# 🔄 Ejecutando migraciones de Prisma...
# ✅ Migraciones completadas!
```

### 5. Verificar que funciona

```bash
# Ver estado de contenedores
docker-compose ps

# Deberías ver 3 contenedores corriendo:
# - health-tracker-db (PostgreSQL)
# - health-tracker-app (Next.js)
# - health-tracker-nginx (Reverse proxy)

# Probar la app
curl http://localhost:3000
```

Abre en tu navegador: `http://tu-ip:3000`

---

## 🌐 Configurar Dominio y SSL (Recomendado)

### Opción 1: Con Certbot (Let's Encrypt) - GRATIS

```bash
# Instalar Certbot
sudo apt install certbot -y

# Detener Nginx temporalmente
docker-compose stop nginx

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com

# Los certificados estarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem

# Crear carpeta SSL en el proyecto
mkdir -p ssl

# Copiar certificados
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem

# Actualizar NEXTAUTH_URL en .env
nano .env
# Cambiar a: NEXTAUTH_URL=https://tu-dominio.com

# Reiniciar servicios
docker-compose up -d
```

### Renovación automática de certificados

```bash
# Crear script de renovación
sudo nano /etc/cron.monthly/renew-ssl.sh
```

Contenido del script:

```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /home/usuario/health-tracker/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /home/usuario/health-tracker/ssl/key.pem
cd /home/usuario/health-tracker
docker-compose restart nginx
```

```bash
# Dar permisos
sudo chmod +x /etc/cron.monthly/renew-ssl.sh
```

### Opción 2: Sin dominio (solo IP)

Si no tienes dominio, puedes usar HTTP simple:

1. Edita `docker-compose.yml` y comenta/elimina el servicio `nginx`
2. La app estará disponible en `http://tu-ip:3000`
3. Actualiza `.env`: `NEXTAUTH_URL=http://tu-ip:3000`

---

## 🔧 Administración

### Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Ver uso de recursos
docker stats

# Entrar a un contenedor
docker exec -it health-tracker-app sh

# Ejecutar comandos de Prisma
docker exec -it health-tracker-app npx prisma studio
```

### Actualizar la aplicación

```bash
# Si usas Git
git pull

# Rebuild y redeploy
./deploy.sh

# O manualmente
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backups

```bash
# Dar permisos al script
chmod +x backup.sh

# Ejecutar backup
./backup.sh

# Los backups se guardarán en ./backups/
```

**Automatizar backups diarios:**

```bash
# Agregar a crontab
crontab -e

# Agregar esta línea (backup diario a las 3 AM)
0 3 * * * cd /home/usuario/health-tracker && ./backup.sh >> /var/log/health-tracker-backup.log 2>&1
```

### Restaurar desde backup

```bash
# Restaurar base de datos
gunzip < backups/db_backup_FECHA.sql.gz | \
  docker exec -i health-tracker-db psql -U healthtracker -d health_tracker

# Restaurar archivos
docker run --rm \
  -v health-tracker_uploads_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads_backup_FECHA.tar.gz -C /data
```

---

## 🔒 Seguridad

### Firewall

```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar reglas
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

### Fail2ban (protección contra fuerza bruta)

```bash
# Instalar
sudo apt install fail2ban -y

# Configurar
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Actualizaciones de seguridad

```bash
# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU, RAM, etc.
docker stats

# Espacio en disco
df -h

# Logs de Docker
journalctl -u docker -f
```

### Configurar alertas (opcional)

Puedes usar servicios como:
- **Uptime Robot** (gratis) - monitorea si tu app está caída
- **Netdata** - dashboard de recursos en tiempo real
- **Prometheus + Grafana** - monitoreo avanzado

---

## 🐛 Solución de Problemas

### La app no arranca

```bash
# Ver logs
docker-compose logs app

# Errores comunes:
# - "NEXTAUTH_SECRET not set" → Revisar .env
# - "Can't connect to database" → Esperar a que PostgreSQL inicie
# - "Port already in use" → Otro servicio usa el puerto 3000
```

### Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Probar conexión manual
docker exec -it health-tracker-db psql -U healthtracker -d health_tracker
```

### Migraciones de Prisma fallan

```bash
# Ver logs específicos de las migraciones
docker-compose logs app | grep -A 10 "Ejecutando migraciones"

# Errores comunes:

# 1. "Can't reach database server"
#    → La base de datos no está lista todavía
#    → Solución: Esperar 30 segundos y reiniciar el contenedor
docker-compose restart app

# 2. "Migration failed"
#    → Puede haber un problema con el schema
#    → Solución: Verificar el schema de Prisma
docker exec -it health-tracker-app npx prisma db push --force-reset
#    ⚠️ CUIDADO: Esto borra todos los datos

# 3. Ejecutar migraciones manualmente
docker exec -it health-tracker-app npx prisma migrate deploy

# 4. Ver estado de las migraciones
docker exec -it health-tracker-app npx prisma migrate status
```

### Cambiar a una base de datos diferente

Si quieres usar una base de datos PostgreSQL externa (no la del Docker Compose):

1. **Actualizar .env:**

```bash
# En lugar de usar postgres:5432 (nombre del contenedor)
# usa la IP/hostname de tu servidor PostgreSQL externo
DATABASE_URL="postgresql://usuario:password@tu-servidor-db.com:5432/health_tracker?schema=public"
```

2. **Comentar el servicio postgres en docker-compose.yml:**

```yaml
# services:
#   postgres:
#     ... (comentar o eliminar esta sección)
```

3. **Ejecutar migraciones en la BD externa:**

```bash
# Las migraciones se ejecutarán automáticamente al iniciar el contenedor
docker-compose up -d --build

# O ejecutarlas manualmente:
docker exec -it health-tracker-app npx prisma migrate deploy
```

4. **Verificar:**

```bash
# Conectarse a la BD externa para verificar las tablas
docker exec -it health-tracker-app npx prisma studio
# Esto abre Prisma Studio en http://localhost:5555
```

### Nginx no arranca

```bash
# Ver logs
docker-compose logs nginx

# Problema común: certificados SSL no existen
# Solución: Crear certificados dummy temporales o comentar nginx del docker-compose.yml
```

### Espacio en disco lleno

```bash
# Ver uso
df -h

# Limpiar imágenes antiguas de Docker
docker system prune -a

# Limpiar logs
sudo journalctl --vacuum-time=7d
```

### Contenedor se reinicia constantemente

```bash
# Ver por qué falla
docker-compose logs app --tail=100

# Verificar variables de entorno
docker exec -it health-tracker-app env | grep -i next
```

---

## 📈 Optimización para Producción

### 1. Limitar recursos de Docker

Edita `docker-compose.yml` y agrega:

```yaml
services:
  app:
    # ... configuración existente ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 2. Configurar log rotation

```bash
# Editar configuración de Docker
sudo nano /etc/docker/daemon.json
```

Agregar:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Reiniciar Docker
sudo systemctl restart docker
```

### 3. Habilitar compresión en Nginx

Ya está configurado en `nginx.conf` incluido.

---

## 💰 Costos

### VPS recomendados

| Proveedor | Plan | Costo/mes | Recursos |
|-----------|------|-----------|----------|
| **DigitalOcean** | Basic Droplet | $6 | 1GB RAM, 1 CPU |
| **Hetzner** | CX11 | €4.5 | 2GB RAM, 1 CPU |
| **Vultr** | Regular Cloud | $6 | 1GB RAM, 1 CPU |
| **Linode** | Nanode | $5 | 1GB RAM, 1 CPU |
| **Contabo** | VPS S | €4 | 4GB RAM, 2 CPU |

**Recomendación**: DigitalOcean o Hetzner para empezar.

---

## ✅ Checklist Post-Deployment

- [ ] App accesible desde el navegador
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Subida de PDFs funciona
- [ ] SSL configurado (si tienes dominio)
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Logs rotando correctamente
- [ ] Actualizaciones automáticas habilitadas
- [ ] Documentaste las credenciales de forma segura

---

## 🎯 Próximos Pasos

1. Configurar backups automáticos a servicio externo (S3, BackBlaze)
2. Implementar CDN (Cloudflare) para mejorar velocidad
3. Configurar monitoreo con Uptime Robot
4. Implementar almacenamiento de archivos en la nube (S3)
5. Configurar email notifications

---

## 🆘 Soporte

**Logs importantes:**
- App: `docker-compose logs app`
- DB: `docker-compose logs postgres`
- Nginx: `docker-compose logs nginx`

**Comandos de diagnóstico:**
```bash
# Estado completo
docker-compose ps
docker stats
df -h
free -h
```

---

¡Tu Health Tracker está corriendo en Docker! 🎉
