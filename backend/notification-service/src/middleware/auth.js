const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');
const { MESSAGES } = require('../config/constants');

const auth = (req, res, next) => {
  try {
    // Get token from header (allow "Bearer <token>" or raw token)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token missing'
      });
    }

    // Verify token with the shared secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // Log once per request for debugging
    console.log('Decoded JWT (notification):', decoded);

    const role = (decoded.role || decoded.role_name || '').toUpperCase();

    req.user = {
      id: decoded.id,
      role,
      email: decoded.email
    };

    logger.info(`Authenticated user: ${decoded.id}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      error: error.message
    });
  }
};

module.exports = auth;
