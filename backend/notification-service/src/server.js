const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const config = require("./config/env");
const { testConnection } = require("./config/database");
const notificationRoutes = require("./routes/notificationRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

/* ======================
   BASIC MIDDLEWARE
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   CORS CONFIG (FINAL)
====================== */
const allowedOrigins = [
  // Local
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",

  // Production (Render)
  "https://user-carbonpositive2026.onrender.com",
  "https://org-carbonpositive2026.onrender.com",
  "https://admin-carbonpositive2026.onrender.com",

  // Optional custom domain
  "https://www.gocarbonpositive.com",

  // Optional env
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ]
};

// 🔥 SAME CORS FOR NORMAL + PREFLIGHT
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ======================
   ROUTES
====================== */
app.use("/api/notifications", notificationRoutes);

/* ======================
   TEST AUTH ROUTE
====================== */
const auth = require("./middleware/auth");
app.get("/api/test-auth", auth, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user
  });
});

/* ======================
   HEALTH CHECK
====================== */
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? "success" : "error",
      service: config.serviceName,
      database: dbConnected ? "connected" : "disconnected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      service: config.serviceName,
      error: err.message
    });
  }
});

/* ======================
   404 HANDLER
====================== */
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

/* ======================
   ERROR HANDLER
====================== */
app.use(errorHandler);

/* ======================
   START SERVER
====================== */
const PORT = config.port || 5005;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    app.listen(PORT, () => {
      logger.info(`
========================================
🚀 Notification Service Started
========================================
Service: ${config.serviceName}
Port: ${PORT}
Env: ${config.nodeEnv}
CORS Allowed Origins:
${allowedOrigins.join("\n")}
========================================
      `);
    });
  } catch (err) {
    logger.error("❌ Server start failed:", err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
