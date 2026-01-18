const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ==================== SECURITY ====================
app.use(helmet());

// ==================== LOGGING ====================
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  // 🔹 Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",

  // 🔹 Production frontends (Render)
  "https://user-carbonpositive2026.onrender.com",
  "https://org-carbonpositive2026.onrender.com",
  "https://admin-carbonpositive2026.onrender.com",

  // 🔹 Custom domain
  "https://www.gocarbonpositive.com",

  // 🔹 From environment (optional)
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, Postman, curl, mobile apps
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }

      console.log(`❌ CORS blocked: ${normalizedOrigin}`);
      callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ IMPORTANT: allow preflight for all routes
app.options("*", cors());

// ==================== BODY PARSING ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CACHE CONTROL ====================
app.disable("etag");
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ==================== RATE LIMITING ====================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ==================== ROUTES ====================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./middlewares/authorize");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);

// ==================== HEALTH ====================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "authentication-service",
    timestamp: new Date().toISOString(),
  });
});

// ==================== TEST ====================
app.get("/api/test-auth", verifyToken, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

// ==================== 404 ====================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "Origin not allowed",
    });
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
===============================
🚀 Auth Service Started
===============================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
CORS Origins:
${allowedOrigins.join("\n")}
===============================
  `);
});

module.exports = app;
