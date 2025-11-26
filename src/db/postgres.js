import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || (() => {
  const host = process.env.PGHOST || 'localhost';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const port = process.env.PGPORT || 5432;
  const database = process.env.PGDATABASE || 'matchup';
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
})();

const useSsl = (process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable') || process.env.NODE_ENV === 'production';
const pool = new Pool({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : false });

export const query = (text, params) => pool.query(text, params);
export const get = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows[0];
};
export const all = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows;
};
export const run = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

// Ensure migrations / tables exist
export async function init() {
  console.log('📌 Inicializando conexión a PostgreSQL');
  try {
    // Test connection
    const ping = await pool.query('SELECT 1');
    console.log('📌 PostgreSQL connection test OK');
  } catch (err) {
    console.error('❌ Error en la conexión a PostgreSQL (test):', err.message);
    throw err;
  }
  // Create tables adapted for PostgreSQL
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    document TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    description TEXT DEFAULT '',
    chatlink TEXT DEFAULT '',
    confirmed BOOLEAN DEFAULT FALSE,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    country TEXT,
    state TEXT,
    city TEXT
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gender TEXT,
    birthday DATE,
    interests TEXT,
    location_id INTEGER REFERENCES locations(id)
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user1_id, user2_id)
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_user INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);

  // List tables to confirm
  try {
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('📌 Public tables:', tables.rows.map(r => r.tablename).join(', '));
  } catch (err) {
    console.error('❌ Error obteniendo lista de tablas:', err.message);
  }

  console.log('✔ Postgres tables initialized');
}

export default { query, get, all, run, init, pool };
