const { Pool } = require("pg");

/* ✅ dotenv ONLY for local development */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* ==================== POOL CONFIG ==================== */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),

  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false } // Cloud SQL
      : false,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/* ==================== EVENTS ==================== */
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected DB error:", err);
});

/* ==================== TEST CONNECTION ==================== */
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("🕐 DB time:", res.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

/* ==================== HELPERS ==================== */
const query = async (text, params) => {
  return pool.query(text, params);
};

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
};
