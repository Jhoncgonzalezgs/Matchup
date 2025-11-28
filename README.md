# MatchUp Backend

Este repositorio contiene el backend Node.js para MatchUp (Postgres + Express).

Nota: El cliente Android (anterior `front/`) fue movido a la rama `front-archive` y ya no forma parte del branch `main`.

Cómo correr (local):

1. Definir variables de entorno (ejemplo `.env`):

```bash
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
npm ci
npm run dev
```

3. Ejecutar migraciones (Postgres) y crear admin si es necesario:

```bash
npm run migrate
ADMIN_EMAIL=admin@matchup.com ADMIN_PASSWORD=admin123 node scripts/create_admin.js
```

Docker:

```bash
docker build -t matchup-backend:latest .
docker run -it -p 3000:3000 --env JWT_SECRET="REEMPLAZA" --env DATABASE_URL="postgresql://user:pass@host:5432/db" matchup-backend:latest
```
