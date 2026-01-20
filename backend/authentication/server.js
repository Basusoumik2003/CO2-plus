const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

/* ✅ dotenv ONLY for local (Cloud Run me env UI se aata hai) */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

/* 🔥 REQUIRED FOR CLOUD RUN (rate-limit + proxy fix) */
app.set("trust proxy", 1);

/* ==================== SECURITY ==================== */
app.use(helmet());

/* ==================== LOGGING ==================== */
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* ==================== CORS ==================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.gocarbonpositive.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`❌ CORS blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==================== BODY PARSING ==================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== CACHE CONTROL ==================== */
app.disable("etag");
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* ==================== RATE LIMITING ==================== */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

/* ==================== ROUTES ==================== */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./middlewares/authorize");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);

/* ==================== ROOT ROUTE (NEW – IMPORTANT) ==================== */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Authentication service is running",
  });
});

/* ==================== HEALTH CHECK ==================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "authentication-service",
    timestamp: new Date().toISOString(),
  });
});

/* ==================== TEST AUTH ==================== */
app.get("/api/test-auth", verifyToken, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

/* ==================== ERROR HANDLING ==================== */
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

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
  });
});

/* ==================== START SERVER (CLOUD RUN COMPATIBLE) ==================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`
================================
🚀 Auth Service Started
================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
================================
`);
});

module.exports = app;
