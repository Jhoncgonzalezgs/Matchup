# Dockerfile para despliegue (Render o cualquier registry de contenedores)
# Usamos node:18-alpine por tamaño reducido y soporte LTS
FROM node:18-alpine

# Crear usuario no-root (opcional en Alpine) para correr la app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias en modo producción
RUN npm ci --only=production || npm install --production

# Copiar el resto de archivos
COPY . .

# Crear directorio persistente para BD y uploads (Render: 'disk' persistent en /data)
RUN mkdir -p /data/uploads && chown -R appuser:appgroup /data && chown -R appuser:appgroup /usr/src/app

# Variables de entorno por defecto (puedes sobrescribirlas en Render)
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/matchup.db
ENV UPLOADS_DIR=/data/uploads

EXPOSE 3000

# Cambiar al usuario no-root
USER appuser

# Iniciar la aplicación
CMD ["node", "server.js"]
