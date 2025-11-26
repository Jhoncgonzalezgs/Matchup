import db from '../src/db/postgres.js';

async function run() {
  try {
    await db.init();
    console.log('Migrations executed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
