import db from '../src/db/database.js';

// Ejecuta la inicialización (el propio import en database.js hace las DDLs)
console.log('Ejecutando migraciones...');

// Esperar un breve tiempo para que las tablas se creen en la serialización
setTimeout(() => {
    console.log('Migración finalizada');
    process.exit(0);
}, 1000);
