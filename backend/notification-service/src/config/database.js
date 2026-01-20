const { Pool } = require('pg');

// ⚠️ Cloud Run me dotenv ki zarurat nahi hoti
// dotenv sirf local development ke liye hota hai
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

let pool;

/**
 * Lazy pool creation
 * Pool tabhi banega jab pehli baar DB access hoga
 */
const getPool = () => {
  if (!pool) {
    if (!process.env.DB_HOST) {
      console.warn('⚠️ DB_HOST not set. Database disabled.');
      return null;
    }

    pool = new Pool({
      host: process.env.DB_HOST,           // 👈 Cloud SQL PUBLIC IP
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: false // Cloud SQL public IP ke liye
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected DB pool error:', err.message);
    });
  }

  return pool;
};

/**
 * Test DB connection (non-blocking)
 */
const testConnection = async () => {
  try {
    const pool = getPool();
    if (!pool) return false;

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('✅ Notification DB connected');
    return true;
  } catch (err) {
    console.error('⚠️ Notification DB connection failed:', err.message);
    return false;
  }
};

/**
 * Query helper
 */
const query = async (text, params) => {
  const pool = getPool();
  if (!pool) throw new Error('Database not configured');

  return pool.query(text, params);
};

/**
 * Transaction helper
 */
const transaction = async (callback) => {
  const pool = getPool();
  if (!pool) throw new Error('Database not configured');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  transaction,
  testConnection
};
