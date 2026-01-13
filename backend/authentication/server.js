// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // ✅ Allow requests from frontend
// app.use(cors({
//   origin: 'https://www.gocarbonpositive.com', // your React app URL
//   credentials: true, // if you use cookies
// }));

// app.use(express.json());

// // Your routes
// app.use('/api/auth', require('./routes/authRoutes'));

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



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
// Support multiple origins for different environments
const allowedOrigins = [
  "http://localhost:5173",     // Main frontend
  "http://localhost:5174",     // Admin dashboard
  "http://localhost:3000",     // Alternative dev port
  "http://localhost:3001",     // Admin app dev port (Vite)
  "https://www.gocarbonpositive.com",
  process.env.FRONTEND_URL,    // From .env
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==================== BODY PARSING ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CACHE CONTROL ====================
// Disable HTTP caching to avoid 304/no-body responses causing empty data in Admin app
app.disable('etag');
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ==================== RATE LIMITING ====================
// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    status: 'error',
    message: "Too many requests, please try again later." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { 
    status: 'error',
    message: "Too many authentication attempts, please try again later." 
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

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "authentication-service",
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.get("/api/test-auth", verifyToken, (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: "Route not found" 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'Origin not allowed'
    });
  }
  
  res.status(err.status || 500).json({ 
    status: 'error',
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`
    ================================
    🚀 Auth Service Started
    ================================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    CORS: ${allowedOrigins.length} origins enabled
    ================================
  `);
});

module.exports = app;
