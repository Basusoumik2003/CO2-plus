const app = require("./app");
const config = require("./config/env");
const logger = require("./utils/logger");
const { testConnection } = require("./config/database");

const PORT = config.port || 5000;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info("Testing database connection...");
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error("Failed to connect to database. Exiting...");
      process.exit(1);
    }

    logger.info("✅ Database connected successfully");

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info("========================================");
      logger.info(`🚀 CO2+ Asset Service Started`);
      logger.info(`📡 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Server: http://localhost:${PORT}`);
      logger.info(`📊 API Base: http://localhost:${PORT}/api/v1`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
      logger.info("========================================");
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info("✅ HTTP server closed");

        // Close database connections
        const { pool } = require("./config/database");
        pool.end(() => {
          logger.info("✅ Database connections closed");
          logger.info("👋 Goodbye!");
          process.exit(0);
        });
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("⚠️  Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
