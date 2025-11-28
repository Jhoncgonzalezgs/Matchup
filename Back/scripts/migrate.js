import pg from '../src/db/postgres.js';

// Ejecuta la inicialización (el propio import en database.js hace las DDLs)
console.log('Ejecutando migraciones en Postgres...');

// Inicia la conexión y crea tablas si no existen
pg.init().then(() => console.log('Migraciones (Postgres) finalizadas')).catch(err => {
    console.error('Error en migración:', err.message);
    process.exit(1);
});

// Esperar un breve tiempo para que las tablas se creen en la serialización
setTimeout(() => { process.exit(0); }, 1500);
