const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const config = require("./config/env");
const logger = require("./utils/logger");
const { testConnection } = require("./config/database");

// Import middleware
const {
  configureCORS,
  configureHelmet,
  sanitizeRequest,
} = require("./middleware/security");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import routes
const routes = require("./routes");

// Create Express app
const app = express();

/**
 * ========================================
 * MIDDLEWARE CONFIGURATION
 * ========================================
 */

// Security middleware
app.use(configureHelmet()); // Security headers
app.use(configureCORS()); // CORS configuration

// Request parsing
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// Compression
app.use(compression()); // Gzip compression

// Request sanitization
app.use(sanitizeRequest);

// Logging
if (config.nodeEnv === "development") {
  app.use(morgan("dev")); // Detailed logging in development
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Rate limiting
app.use("/api/", apiLimiter);

/**
 * ========================================
 * ROUTES
 * ========================================
 */

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CO2+ Asset Management Service API",
    version: "1.0.0",
    environment: config.nodeEnv,
    endpoints: {
      health: "/api/v1/health",
      evs: "/api/v1/evmasterdata",
      solar: "/api/v1/solarpanel",
      trees: "/api/v1/tree",
      transactions: "/api/v1/evtransaction",
      images: "/api/v1/image/upload",
      status: "/api/v1/assets/user/:userId/status",
    },
    documentation: "https://github.com/your-repo/api-docs",
  });
});

// API routes
app.use("/api/v1", routes);

// Test database connection endpoint
app.get("/api/v1/test-db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.status(200).json({
        status: "success",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "error",
        message: "Database connection failed",
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Database connection error",
      error: error.message,
    });
  }
});

/**
 * ========================================
 * ERROR HANDLING
 * ========================================
 */

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

/**
 * ========================================
 * GRACEFUL SHUTDOWN
 * ========================================
 */

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", {
    error: err.message,
    stack: err.stack,
  });

  if (config.nodeEnv === "production") {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", {
    error: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

module.exports = app;
