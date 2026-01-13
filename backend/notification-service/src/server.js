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

// ✅ CORS configuration - HARDCODED FOR TESTING
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== ROUTES ====================
app.use('/api/notifications', notificationRoutes);

// Test auth route
const auth = require('./middleware/auth');
app.get('/api/test-auth', auth, (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
});

// Health check endpoint
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

// ==================== ERROR HANDLING ====================
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = config.port;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`
        ================================
        🚀 Notification Service Started
        ================================
        Service: ${config.serviceName}
        Port: ${PORT}
        Environment: ${config.nodeEnv}
        Database: ${config.db.host}:${config.db.port}/${config.db.name}
        CORS: Enabled for http://localhost:3001
        ================================
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
