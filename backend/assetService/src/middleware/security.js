const helmet = require("helmet");
const cors = require("cors");
const config = require("../config/env");

/**
 * ================================
 * CORS CONFIGURATION
 * ================================
 */

const allowedOrigins = [
  // 🔹 Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",

  // 🔹 Production frontends (Render)
  "https://user-carbonpositive2026.onrender.com",
  "https://org-carbonpositive2026.onrender.com",
  "https://admin-carbonpositive2026.onrender.com",

  // 🔹 Custom domain (optional)
  "https://www.gocarbonpositive.com",

  // 🔹 From environment
  config.frontendUrl,
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // ✅ Allow non-browser tools (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    // ✅ Allow localhost
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      return callback(null, true);
    }

    // ✅ Allow whitelisted domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // for legacy browsers
};

/**
 * ================================
 * SECURITY HEADERS
 * ================================
 */

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: [
        "'self'",
        "https://authentication-service2026.onrender.com",
        "https://notification-service2026.onrender.com",
        "https://asset-service2026.onrender.com",
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * ================================
 * REQUEST SANITIZATION
 * ================================
 */

const sanitizeRequest = (req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data")
  ) {
    return next();
  }

  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(/\0/g, "");
    }
    if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  req.params = sanitize(req.params);
  req.query = sanitize(req.query);

  next();
};

module.exports = {
  corsOptions,
  helmetConfig,
  sanitizeRequest,
  configureCORS: () => cors(corsOptions),
  configureHelmet: () => helmetConfig,
};
