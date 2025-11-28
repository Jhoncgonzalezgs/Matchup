import db from '../src/db/postgres.js';
import bcrypt from 'bcryptjs';

const email = process.env.ADMIN_EMAIL || 'admin@matchup.com';
const password = process.env.ADMIN_PASSWORD || 'admin123';

(async function createAdmin() {
    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.run(`INSERT INTO users (email, document, password, role, confirmed) VALUES ($1, $2, $3, $4, true)`, [email, 'ADMIN', hashed, 'admin']);
        console.log('Admin creado con email:', email);
        process.exit(0);
    } catch (err) {
        console.error('Error agregando admin:', err.message);
        process.exit(1);
    }
})();
