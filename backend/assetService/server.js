const app = require("./src/app");
const logger = require("./src/utils/logger");
const { pool, testConnection } = require("./src/config/database");

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info("========================================");
  logger.info("🚀 CO2+ Asset Service Started");
  logger.info(`🌐 Listening on port ${PORT}`);
  logger.info("========================================");
});

// DB test (non-blocking)
testConnection().catch(err => {
  logger.error("❌ DB connection failed on startup", err.message);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await pool.end();
  server.close(() => process.exit(0));
});
