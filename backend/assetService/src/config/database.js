const { Pool } = require('pg');
const path = require('path');

// Load .env from root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug: Log what we're reading
console.log('Loading database config...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('Password loaded:', !!process.env.DB_PASSWORD);

// Create connection pool - reading DIRECTLY from process.env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // Force to string
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
const testConnection = async () => {
  let client;
  try {
    console.log('Attempting database connection...');
    client = await pool.connect();
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log('Current time:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Log connection details (without password)
    console.error('Connection attempted with:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      passwordLength: process.env.DB_PASSWORD?.length
    });
    
    if (client) client.release();
    return false;
  }
};

// Query helper
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// ✅ ADDED: Transaction helper function
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// ✅ FIXED: Export transaction function
module.exports = {
  pool,
  query,
  transaction,  // ✅ Added this line
  testConnection
};
