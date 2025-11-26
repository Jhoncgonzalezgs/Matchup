# Despliegue en Render con Docker

Este documento explica cómo desplegar la API en Render usando el `Dockerfile` incluido.

## 1) Subir a un repo git (ya lo tienes)

Render despliega desde GitHub, GitLab o un repositorio público/privado.

## 2) Crear servicio en Render

1. En Render, crear nuevo servicio: **Web Service** → elegir la opción **Docker**.
2. Seleccionar el repositorio y la rama correcta.
3. Indicar el puerto **3000** (por defecto) si no lo estableces con env.

## 3) Variables de entorno (en Render Dashboard → Environment)

- NODE_ENV=production
- PORT=3000
- JWT_SECRET=tu_clave_super_segura
- DB_PATH=/data/matchup.db      # Render proporciona /data como disco persistente si configuras un 'Disk'
- UPLOADS_DIR=/data/uploads
- SMTP_HOST (opcional), SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

### Uso del disco persistente
- Render ofrece la posibilidad de añadir un **Persistent Disk** a tu servicio y montarlo en */data* ; eso mantendrá `matchup.db` y la carpeta `uploads/` entre despliegues.
- Si no añades un disk persistente, no uses SQLite en producción: usa una base de datos administrada como PostgreSQL y actualiza `DB_PATH` y los adaptadores.

## 4) Health-check (opcional)
Render puede comprobar la ruta `/` para confirmar el despliegue.

## 5) Construir / Deploy
Render construirá la imagen usando el Dockerfile y desplegará la app.

## 6) Notas y recomendaciones
- SQLite es adecuado para prototipos/local, pero para producción con tráfico real se recomienda migrar a PostgreSQL o MySQL.
- Validar que `JWT_SECRET` y SMTP estén configurados.
- Si necesitas que el servidor corra con un usuario no-root, `Dockerfile` ya lo crea.

## 7) Cambios en la app para producción
- `DB_PATH` y `UPLOADS_DIR` ahora son configurables con variables de entorno.
- `uploads` se sirve desde `UPLOADS_DIR`.

Si quieres, puedo crear los scripts para migrar a PostgreSQL o añadir un servicio `docker-compose` para pruebas locales con una DB persistente.
