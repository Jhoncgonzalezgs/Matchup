# MatchUp Backend

Este directorio contiene el backend Node.js para MatchUp (Postgres + Express).

Cómo correr (local):

1. Definir variables de entorno (ejemplo `.env`):

```
NODE_ENV=development
PORT=3000
JWT_SECRET=secret_for_local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/matchup
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=matchup
PGPORT=5432
UPLOADS_DIR=/data/uploads
```

2. Instalar dependencias y arrancar:

```bash
cd Back
npm ci
npm run dev
```

3. Ejecutar migraciones (Postgres) y crear admin si es necesario:

```bash
cd Back
node scripts/migrate.js
ADMIN_EMAIL=admin@matchup.com ADMIN_PASSWORD=admin123 node scripts/create_admin.js
```

Docker:

```bash
cd Back
docker build -t matchup-backend:latest .
docker run -it -p 3000:3000 --env JWT_SECRET="REEMPLAZA" --env DATABASE_URL="postgresql://user:pass@host:5432/db" matchup-backend:latest
```
