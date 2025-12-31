# Health Tracker

Sistema de gestión de salud personal con encriptación de datos y procesamiento inteligente de exámenes médicos.

## Características

- **Autenticación segura** con NextAuth.js
- **Encriptación AES-256-GCM** para datos sensibles
- **Almacenamiento seguro** de documentos PDF
- **Procesamiento inteligente** de PDFs con IA (Claude API)
- **Gestión de exámenes médicos** y citas
- **Interfaz moderna** con Next.js 14 y Tailwind CSS

## Stack Tecnológico

- **Frontend + Backend**: Next.js 14 con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Encriptación**: Node.js Crypto (AES-256-GCM)
- **IA**: Anthropic Claude API
- **Estilos**: Tailwind CSS
- **Deployment**: Docker ready para VPS

## 🚀 Opciones de Instalación

Elige el método que prefieras:

### 🐳 Opción 1: Docker (Recomendado para VPS)

**La forma más rápida de desplegar en producción.**

```bash
# Setup automático en VPS limpio
./setup-vps.sh

# O manual
cp .env.production .env
nano .env  # Configurar variables
./deploy.sh
```

📖 **[Guía completa de Docker →](DOCKER-QUICKSTART.md)**
📖 **[Guía completa de VPS →](DEPLOY-VPS-DOCKER.md)**

### 💻 Opción 2: Desarrollo Local (Sin Docker)

**Para desarrollo o testing local.**

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env` y configura las siguientes variables:

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/health_tracker"

# NextAuth.js
# Genera con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Clave maestra para encriptación
# Genera con: openssl rand -base64 32
MASTER_ENCRYPTION_KEY="tu-clave-de-encriptacion-aqui"

# Claude API (opcional, para procesamiento de PDFs con IA)
ANTHROPIC_API_KEY="tu-api-key-de-anthropic"
```

#### Generar claves seguras

Para generar las claves de forma segura, ejecuta:

```bash
# NextAuth Secret
openssl rand -base64 32

# Master Encryption Key
openssl rand -base64 32
```

### 3. Configurar la base de datos

#### Opción A: PostgreSQL local

Instala PostgreSQL y crea una base de datos:

```bash
createdb health_tracker
```

Luego actualiza `DATABASE_URL` en `.env`:

```
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/health_tracker"
```

#### Opción B: Prisma Postgres (recomendado para desarrollo)

```bash
npx prisma dev
```

Esto iniciará un servidor PostgreSQL local automáticamente.

### 4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 5. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
health-tracker/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # Rutas de autenticación
│   │   │   └── register/         # Registro de usuarios
│   │   └── exams/
│   │       └── upload/            # Subida de exámenes
│   ├── auth/
│   │   ├── signin/                # Página de inicio de sesión
│   │   └── signup/                # Página de registro
│   ├── dashboard/
│   │   ├── upload/                # Página de subida de exámenes
│   │   └── page.tsx               # Dashboard principal
│   └── page.tsx                   # Página de inicio
├── lib/
│   ├── auth.ts                    # Configuración de NextAuth
│   ├── prisma.ts                  # Cliente de Prisma
│   ├── encryption.ts              # Utilidades de encriptación
│   ├── file-storage.ts            # Gestión de archivos
│   └── pdf-processor.ts           # Procesamiento de PDFs con IA
├── prisma/
│   └── schema.prisma              # Schema de la base de datos
└── uploads/                       # Archivos subidos (encriptados)
```

## Seguridad

### Encriptación

- Los datos sensibles se encriptan con **AES-256-GCM**
- Cada usuario tiene su propia clave de encriptación
- Las claves de usuario se encriptan con la clave maestra
- Los archivos PDF se almacenan encriptados en el servidor

### Contraseñas

- Las contraseñas se hashean con **bcrypt** (12 rounds)
- Mínimo 8 caracteres requeridos

### Sesiones

- JWT tokens para gestión de sesiones
- Expiración automática de sesiones

## Uso

### 1. Registro

Accede a `/auth/signup` y crea una cuenta con tu email y contraseña.

### 2. Subir un examen

1. Inicia sesión
2. Haz clic en "Subir Nuevo Examen"
3. Selecciona el archivo PDF
4. Completa los datos del examen
5. El sistema procesará automáticamente el PDF con IA

### 3. Ver exámenes

Los exámenes aparecerán en tu dashboard con información extraída automáticamente.

## API de Claude (Opcional)

Para habilitar el procesamiento inteligente de PDFs:

1. Crea una cuenta en [Anthropic Console](https://console.anthropic.com/)
2. Genera una API key
3. Agrégala a `.env` como `ANTHROPIC_API_KEY`

Si no configuras la API key, los exámenes se guardarán igualmente pero sin procesamiento de IA.

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Prisma Studio (explorador de base de datos)
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (CUIDADO: elimina todos los datos)
npx prisma migrate reset
```

## Próximas Características

- [ ] Integración con email para recibir exámenes automáticamente
- [ ] Gráficos y visualización de tendencias
- [ ] Gestión avanzada de citas médicas
- [ ] Recordatorios y notificaciones
- [ ] Exportación de datos
- [ ] App móvil

## Licencia

MIT
