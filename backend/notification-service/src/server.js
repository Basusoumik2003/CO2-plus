const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = require('./config/env');
const { testConnection } = require('./config/database');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  // 🔹 Local development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',

  // 🔹 Production frontends (Render)
  'https://user-carbonpositive2026.onrender.com',
  'https://org-carbonpositive2026.onrender.com',
  'https://admin-carbonpositive2026.onrender.com',

  // 🔹 Custom domain (optional)
  'https://www.gocarbonpositive.com',

  // 🔹 From environment (optional)
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman, curl, server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle all preflight requests
app.options('*', cors());

// ==================== ROUTES ====================
app.use('/api/notifications', notificationRoutes);

// ==================== TEST AUTH ====================
const auth = require('./middleware/auth');
app.get('/api/test-auth', auth, (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'success' : 'error',
      service: config.serviceName,
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: config.serviceName,
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== 404 ====================
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = config.port;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(PORT, () => {
      logger.info(`
===============================
🚀 Notification Service Started
===============================
Service: ${config.serviceName}
Port: ${PORT}
Environment: ${config.nodeEnv}
Database: ${config.db.host}:${config.db.port}/${config.db.name}
CORS Origins:
${allowedOrigins.join('\n')}
===============================
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
