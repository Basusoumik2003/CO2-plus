const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { NOTIFICATION_TYPES } = require('../config/constants');

class NotificationService {

  /* ================= SIGNUP ================= */

  static async handleSignup(userData, req) {
    try {
      if (!userData?.email) throw new Error('Invalid user data');

      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const deviceInfo = req?.get?.('user-agent') || 'unknown';

      return await Notification.create({
        event_type: NOTIFICATION_TYPES.USER_SIGNUP,
        user_id: userData.id || null,
        username: userData.username || userData.email,
        email: userData.email,
        user_role: userData.role || 'user',
        ip_address: ipAddress,
        device_info: deviceInfo,
        metadata: {
          action: 'New user registration',
          source: 'signup'
        }
      });

    } catch (error) {
      logger.error('❌ Signup notification error:', error);
      throw error;
    }
  }

  /* ================= LOGIN ================= */

  static async handleLogin(userData, req) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const deviceInfo = req?.get?.('user-agent') || 'unknown';

      return await Notification.create({
        event_type: NOTIFICATION_TYPES.USER_LOGIN,
        user_id: userData.id || null,
        username: userData.username || userData.email,
        email: userData.email,
        user_role: userData.role || 'user',
        ip_address: ipAddress,
        device_info: deviceInfo,
        metadata: {
          action: 'User login',
          source: 'login'
        }
      });

    } catch (error) {
      logger.error('❌ Login notification error:', error);
      throw error;
    }
  }

  /* ================= FAILED LOGIN ================= */

  static async handleFailedLogin(email, req, attemptNumber = 1) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const deviceInfo = req?.get?.('user-agent') || 'unknown';

      return await Notification.create({
        event_type: NOTIFICATION_TYPES.FAILED_LOGIN,
        user_id: null,
        username: email,
        email,
        user_role: 'unknown',
        ip_address: ipAddress,
        device_info: deviceInfo,
        metadata: {
          action: 'Failed login attempt',
          attempt_number: attemptNumber,
          severity: attemptNumber >= 3 ? 'high' : 'low',
          source: 'security'
        }
      });

    } catch (error) {
      logger.error('❌ Failed login notification error:', error);
      throw error;
    }
  }

  /* ================= ACCOUNT LOCKED ================= */

  static async handleAccountLocked(email, req) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const deviceInfo = req?.get?.('user-agent') || 'unknown';

      return await Notification.create({
        event_type: NOTIFICATION_TYPES.ACCOUNT_LOCKED,
        user_id: null,
        username: email,
        email,
        user_role: 'unknown',
        ip_address: ipAddress,
        device_info: deviceInfo,
        metadata: {
          action: 'Account locked',
          severity: 'critical',
          source: 'security'
        }
      });

    } catch (error) {
      logger.error('❌ Account locked notification error:', error);
      throw error;
    }
  }

  /* ================= EMAIL VERIFIED ================= */

  static async handleEmailVerified(userData) {
    try {
      return await Notification.create({
        event_type: NOTIFICATION_TYPES.EMAIL_VERIFIED,
        user_id: userData.id || null,
        username: userData.username || userData.email,
        email: userData.email,
        user_role: userData.role || 'user',
        ip_address: 'system',
        device_info: 'system',
        metadata: {
          action: 'Email verified',
          source: 'email'
        }
      });

    } catch (error) {
      logger.error('❌ Email verified notification error:', error);
      throw error;
    }
  }

  /* ================= STATS ================= */

  static async getStats(hoursBack = 24) {
    return await Notification.getStats(hoursBack);
  }
}

module.exports = NotificationService;
