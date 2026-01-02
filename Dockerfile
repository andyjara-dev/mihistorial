# Dockerfile para Health Tracker

# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments para variables NEXT_PUBLIC_*
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar el resto del código (incluye prisma.config.ts)
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js (con NEXT_PUBLIC_* disponibles)
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar dependencias necesarias
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copiar script de entrypoint
COPY docker-entrypoint.sh ./

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Dar permisos de ejecución al entrypoint
RUN chmod +x docker-entrypoint.sh

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Script de inicio que ejecuta migraciones y luego la app
CMD ["./docker-entrypoint.sh"]
