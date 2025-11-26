# Docker - Build & Run

## Construir imagen local

```bash
# Build
docker build -t matchup-backend:latest .

# Correr contenedor (volumen de datos local para persistencia)
docker run -it --rm -p 3000:3000 -e JWT_SECRET=mi_jwt_secreto -e DB_PATH=/data/matchup.db -e UPLOADS_DIR=/data/uploads -v $(pwd)/data:/data matchup-backend:latest
```

## Usar docker-compose (más práctico)

```bash
docker-compose up --build
```

Esto montará el volumen local `./data` en `/data` dentro del contenedor para persistir la DB y la carpeta de uploads.

## Notas
- Para producción en Render, no uses el archivo `.env`; configura variables de entorno en el panel de Render.
- Para un despliegue escalable preferible, cambia SQLite por PostgreSQL u otro servicio gestionado.
