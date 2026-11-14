// One-time script: delete all demo/test data, keep system tables (courses, questions)
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function clearDemoData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete in FK order
    const steps = [
      ['messages',          'DELETE FROM messages'],
      ['course_attempts',   'DELETE FROM course_attempts'],
      ['notifications',     'DELETE FROM notifications'],
      ['applications',      'DELETE FROM applications'],
      ['bookings',          'DELETE FROM bookings'],
      ['reviews',           'DELETE FROM reviews'],
      ['announcements',     'DELETE FROM announcements'],
      ['provider_services', 'DELETE FROM provider_services'],
      ['provider_profiles', 'DELETE FROM provider_profiles'],
      ['users',             'DELETE FROM users'],
    ];

    for (const [label, sql] of steps) {
      const r = await client.query(sql);
      console.log(`  ${label}: ${r.rowCount} rows deleted`);
    }

    await client.query('COMMIT');
    console.log('\nAll demo data cleared. Courses and questions are unchanged.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error — rolled back:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

clearDemoData();
