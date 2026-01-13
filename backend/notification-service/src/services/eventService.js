const logger = require('../utils/logger');
const NotificationService = require('./notificationService');

class EventService {

  static async processEvent(eventData) {
    try {
      if (!eventData || !eventData.event_type) {
        throw new Error('Invalid event data: event_type is required');
      }

      const { event_type, user, ip_address, device_info, attempt_number } = eventData;

      // ✅ NORMALIZED USER (🔥 IMPORTANT)
      const safeUser = user ? {
        id: user.id || null,
        username: user.username || user.name || null,
        email: user.email || null,
        role: user.role || user.user_role || 'user'
      } : null;

      const requestLike = {
        ip: ip_address || null,
        connection: { remoteAddress: ip_address || null },
        get: () => device_info || null
      };

      logger.info(`📨 Processing event: ${event_type}`, { 
        user: safeUser?.email,
        userId: safeUser?.id
      });

      switch (event_type) {

        case 'user.signup':
          if (!safeUser?.email) {
            throw new Error('Invalid signup event: user email is required');
          }
          await NotificationService.handleSignup(safeUser, requestLike);
          break;

        case 'user.login':
          if (!safeUser?.email) {
            throw new Error('Invalid login event: user email is required');
          }
          await NotificationService.handleLogin(safeUser, requestLike);
          break;

        case 'user.login.failed':
          if (!safeUser?.email) {
            throw new Error('Invalid failed login event: user email is required');
          }
          await NotificationService.handleFailedLogin(
            safeUser.email,
            requestLike,
            attempt_number || 1
          );
          break;

        case 'user.account.locked':
          if (!safeUser?.email) {
            throw new Error('Invalid account locked event: user email is required');
          }
          await NotificationService.handleAccountLocked(safeUser.email, requestLike);
          break;

        case 'user.email.verified':
          if (!safeUser?.email) {
            throw new Error('Invalid email verified event: user email is required');
          }
          await NotificationService.handleEmailVerified(safeUser);
          break;

        default:
          logger.warn(`⚠️ Unknown event type: ${event_type}`);
          throw new Error(`Unsupported event type: ${event_type}`);
      }

    } catch (error) {
      logger.error('❌ Error processing event:', {
        error: error.message,
        stack: error.stack,
        eventType: eventData?.event_type
      });
      throw error;
    }
  }
}

module.exports = EventService;
