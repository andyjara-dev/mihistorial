# 🐳 Docker Quickstart - 5 Minutos

Guía ultra-rápida para levantar Health Tracker con Docker.

## ⚡ Inicio Rápido

```bash
# 1. Configurar variables de entorno
cp .env.production .env
nano .env  # Edita las claves

# 2. Desplegar
./deploy.sh

# 3. Ver logs
docker-compose logs -f

# 4. Acceder
# http://localhost:3000
```

## 🔑 Generar Claves

```bash
# Opción 1: Usar Makefile
make env-generate

# Opción 2: Manual
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -base64 32  # MASTER_ENCRYPTION_KEY
openssl rand -base64 32  # DB_PASSWORD
```

## 📝 Comandos Útiles

```bash
# Ver ayuda de todos los comandos
make help

# Iniciar
make up

# Detener
make down

# Ver logs
make logs

# Backup
make backup

# Deploy completo
make deploy
```

## 🌐 Sin Dominio (Solo IP)

Si no tienes dominio, usa el compose simplificado:

```bash
# Usar versión simple (sin Nginx)
docker-compose -f docker-compose.simple.yml up -d

# Acceder en: http://TU_IP:3000
```

## 🔒 Con SSL (Dominio)

```bash
# 1. Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# 2. Copiar certificados
mkdir ssl
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem

# 3. Actualizar .env
NEXTAUTH_URL=https://tu-dominio.com

# 4. Deploy
make deploy

# Acceder en: https://tu-dominio.com
```

## 🐛 Troubleshooting

### Error: "Can't connect to database"
```bash
# Esperar a que PostgreSQL inicie
docker-compose logs postgres

# Reintentar
docker-compose restart app
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
APP_PORT=3001

# Reiniciar
make restart
```

### Ver logs detallados
```bash
# Todos los servicios
make logs

# Solo app
make logs-app

# Solo base de datos
make logs-db
```

## 📚 Documentación Completa

Para instalación completa en VPS, lee: **[DEPLOY-VPS-DOCKER.md](DEPLOY-VPS-DOCKER.md)**

## ✅ Checklist

- [ ] Instalaste Docker y Docker Compose
- [ ] Copiaste `.env.production` a `.env`
- [ ] Generaste claves con `openssl rand -base64 32`
- [ ] Configuraste todas las variables en `.env`
- [ ] Ejecutaste `./deploy.sh`
- [ ] Verificaste que los contenedores estén corriendo: `docker-compose ps`
- [ ] Accediste a la app en el navegador
- [ ] Registraste un usuario de prueba

¡Listo! 🎉
