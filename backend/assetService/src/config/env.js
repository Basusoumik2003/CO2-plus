/* ===============================
   Environment Configuration
   Cloud Run Safe
================================ */

const config = {
  nodeEnv: process.env.NODE_ENV || "development",

  /* ==================== DATABASE ==================== */
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    url: process.env.DATABASE_URL,
  },

  /* ==================== CLOUDINARY ==================== */
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  /* ==================== CORS ==================== */
  cors: {
    origins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5173",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
        ],
  },

  /* ==================== RATE LIMIT ==================== */
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  /* ==================== LOGGING ==================== */
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
