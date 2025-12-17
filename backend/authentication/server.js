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

// Security headers
app.use(helmet());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing
app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authLimiter, authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res
    .status(err.status || 500)
    .json({ message: "Internal server error", error: process.env.NODE_ENV === "production" ? undefined : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
