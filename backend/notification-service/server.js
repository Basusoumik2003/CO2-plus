const express = require("express");
const cors = require("cors");

const config = require("./src/config/env");
const notificationRoutes = require("./src/routes/notificationRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const logger = require("./src/utils/logger");

const app = express();

/* ==================== MIDDLEWARE ==================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== CORS ==================== */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==================== ✅ ROOT ROUTE (IMPORTANT) ==================== */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "notification-service",
    message: "Notification Service is running",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

/* ==================== ROUTES ==================== */
app.use("/api/notifications", notificationRoutes);

/* ==================== HEALTH CHECK ==================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "notification-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ==================== 404 ==================== */
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

/* ==================== ERROR HANDLER ==================== */
app.use(errorHandler);

/* ==================== START SERVER ==================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`
================================
🚀 Notification Service LIVE
================================
Port: ${PORT}
================================
`);
});

module.exports = app;
