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
- DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
	# Alternativa: puedes usar PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
	# Ejemplo: postgresql://postgres:password@db-host:5432/matchup
- SMTP_HOST (opcional), SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

Adicionalmente, para que la documentación Swagger muestre las rutas con la URL correcta, configura:
- BASE_URL=https://<tu-url-en-render>

### Uso del disco persistente
- Render ofrece la posibilidad de añadir un **Persistent Disk** a tu servicio y montarlo en */data* ; eso mantendrá `matchup.db` y la carpeta `uploads/` entre despliegues.
- Si no añades un disk persistente, no uses SQLite en producción: usa una base de datos administrada como PostgreSQL y actualiza `DB_PATH` y los adaptadores.

## 4) Health-check (opcional)
Render puede comprobar la ruta `/` para confirmar el despliegue.

## 5) Construir / Deploy
Render construirá la imagen usando el Dockerfile y desplegará la app.
Si usas Postgres, te recomiendo ejecutar las migraciones después del despliegue o antes de iniciar la app:

- Opción A: Cambiar "Start Command" en Render a: `npm run migrate && npm start` (las migraciones crean las tablas si no existen)
- Opción B: Usar un Job o un comando en el panel de Render `Deploy` → `Deploy Hooks` para ejecutar `npm run migrate` después del despliegue e iniciar la app.

## 6) Notas y recomendaciones
- SQLite es adecuado para prototipos/local, pero para producción con tráfico real se recomienda migrar a PostgreSQL o MySQL.
- Validar que `JWT_SECRET` y SMTP estén configurados.
- Si necesitas que el servidor corra con un usuario no-root, `Dockerfile` ya lo crea.

### Crear un administrador

Puedes crear un admin ejecutando el script incluido en el repo (si tienes acceso al contenedor o en local con `DATABASE_URL` configurada):
```bash
# desde la raíz del repo, con Node y variables de entorno configuradas
node scripts/create_admin.js admin@example.com 99999999 AdminPass123
```
El script insertará un usuario con rol `admin` y cuenta confirmada.

### Migración desde SQLite a Postgres

Si tu base de datos inicial estaba en SQLite y necesitas migrar datos a Postgres, considera usar `pgloader` o exportar tablas a CSV y luego importarlas con `COPY`:

1. Exportar CSV desde SQLite:
```bash
sqlite3 matchup.db "SELECT * FROM users;" > users.csv
```
2. Crear la tabla en Postgres y luego usar `COPY` desde CSV (desde psql o GUI).
Revisa las columnas `confirmed` y `blocked` para que sean `true/false` en Postgres (BOOLEAN).

## 7) Cambios en la app para producción
- `DB_PATH` y `UPLOADS_DIR` ahora son configurables con variables de entorno.
- `uploads` se sirve desde `UPLOADS_DIR`.

## 7) Documentación Swagger

- La API incluye documentación OpenAPI accesible en: `/docs` (Swagger UI).
- Ruta JSON del spec: `/docs.json`.
- Si desplegas en Render y el dominio es `https://example.onrender.com`, la documentación estará disponible en `https://example.onrender.com/docs`.

Si quieres, puedo crear los scripts para migrar a PostgreSQL o añadir un servicio `docker-compose` para pruebas locales con una DB persistente.
