const express = require("express");
const compression = require("compression");
const morgan = require("morgan");

// Security middleware
const {
  configureCORS,
  configureHelmet,
  sanitizeRequest,
} = require("./middleware/security");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Routes
const assetRoutes = require("./routes/assetRoutes");
const orgAssetRoutes = require("./routes/orgAssetRoutes");
const routes = require("./routes");

const app = express();

/* =====================================================
   GLOBAL MIDDLEWARE
===================================================== */

// Security headers & CORS
app.use(configureHelmet());
app.use(configureCORS());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Sanitize input
app.use(sanitizeRequest);

// Logging (Cloud Run safe)
app.use(morgan("combined"));

/* =====================================================
   ROOT & HEALTH (NO RATE LIMIT)
===================================================== */

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "CO2+ Asset Management API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
  });
});

// Health check (Cloud Run expects fast response)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   API (RATE LIMITED)
===================================================== */

app.use("/api/v1", apiLimiter);

// Asset routes
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/org-assets", orgAssetRoutes);

// Other API routes
app.use("/api/v1", routes);

/* =====================================================
   ERROR HANDLING
===================================================== */

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
