import db from '../src/db/database.js';
import bcrypt from 'bcryptjs';

const email = process.env.ADMIN_EMAIL || 'admin@matchup.com';
const password = process.env.ADMIN_PASSWORD || 'admin123';

(async function createAdmin() {
    const hashed = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (email, document, password, role, confirmed) VALUES (?, ?, ?, ?, 1)`, [email, 'ADMIN', hashed, 'admin'], function(err) {
        if (err) {
            console.error('Error agregando admin:', err.message);
            process.exit(1);
        }
        console.log('Admin creado con email:', email);
        process.exit(0);
    });
})();
