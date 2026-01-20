const express = require("express");
const cors = require("cors");

const config = require("./config/env");
const notificationRoutes = require("./routes/notificationRoutes");
const errorHandler = require("./middleware/errorHandler");

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

/* ==================== ROUTES ==================== */
app.use("/api/notifications", notificationRoutes);

/* ==================== HEALTH CHECK ==================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: config.serviceName,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

module.exports = app;
