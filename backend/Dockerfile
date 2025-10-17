FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# ============================================
# Etapa de producción (multi-stage build)
# ============================================
FROM node:22-alpine

WORKDIR /app

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar solo las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar código desde el builder
COPY --from=builder /app . 

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Exponer el puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar la aplicación
CMD ["node", "server.js"]