import db from '../src/db/postgres.js';
import bcrypt from 'bcryptjs';

const argv = process.argv.slice(2);
if (argv.length < 3) {
  console.log('Usage: node create_admin.js <email> <document> <password>');
  process.exit(1);
}

const [email, document, password] = argv;

(async () => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    const res = await db.run(`INSERT INTO users (email, document, password, role, confirmed) VALUES ($1, $2, $3, 'admin', true) RETURNING id`, [email, document, hashed]);
    const id = res.rows && res.rows[0] ? res.rows[0].id : null;
    console.log(`Admin created with id ${id}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();
