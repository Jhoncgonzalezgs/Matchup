import sqlite3 from "sqlite3";
sqlite3.verbose();

// Conexión a la base de datos SQLite
const db = new sqlite3.Database("./matchup.db", (err) => {
    if (err) console.error("❌ Error al conectar a la BD:", err.message);
    else console.log("✔ Base de datos conectada");
});

db.serialize(() => {
    // ACTIVAR LLAVES FORÁNEAS
    db.run("PRAGMA foreign_keys = ON;");

    // ===========================
    // TABLA: USERS
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            document TEXT UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            description TEXT DEFAULT '',
            chatLink TEXT DEFAULT '',
            confirmed INTEGER DEFAULT 0,
            blocked INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ===========================
    // TABLA: TOKENS
    // confirmación / reset password
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            type TEXT NOT NULL,  -- 'confirm' | 'reset'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ===========================
    // TABLA: LOCATIONS
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country TEXT,
            state TEXT,
            city TEXT
        )
    `);

    // ===========================
    // TABLA: DETAILS
    // Perfil del usuario
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            gender TEXT,
            birthday TEXT,
            interests TEXT,
            location_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (location_id) REFERENCES locations(id)
        )
    `);

    // ===========================
    // TABLA: PHOTOS
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ===========================
    // TABLA: MATCHES
    // Like y match mutuo
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user1_id, user2_id),
            FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ===========================
    // TABLA: MESSAGES
    // Mensajería entre matches
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ===========================
    // TABLA: ADMIN LOGS
    // Acciones de moderación
    // ===========================
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            target_user INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    console.log("✔ TODAS LAS TABLAS HAN SIDO CREADAS/VERIFICADAS");
});

export default db;
