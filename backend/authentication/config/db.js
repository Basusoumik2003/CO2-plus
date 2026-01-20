const { Pool } = require("pg");

/* ✅ dotenv ONLY for local */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* =====================================================
   ENV DETECTION
===================================================== */
const isProduction = process.env.NODE_ENV === "production";

/* =====================================================
   CONNECTION CONFIG
   - Cloud Run + Cloud SQL → individual creds + SSL
   - Local → no SSL
===================================================== */
const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,          // Cloud SQL Public IP / Private IP
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: isProduction
    ? { rejectUnauthorized: false }   // Cloud SQL requires SSL
    : false,
};

/* =====================================================
   POOL SETUP
===================================================== */
const pool = new Pool({
  ...connectionConfig,
  max: 10,                     // keep small for Cloud Run free tier
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/* =====================================================
   EVENTS
===================================================== */
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected DB error:", err);
});

/* =====================================================
   STARTUP TEST
===================================================== */
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("🕐 DB time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
})();

module.exports = pool;
