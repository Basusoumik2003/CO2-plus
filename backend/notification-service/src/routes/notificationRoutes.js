const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const EventService = require('../services/eventService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const { MESSAGES, ROLES } = require('../config/constants');

/**
 * Receive events from auth service
 * POST /api/notifications/event
 */
router.post('/event', async (req, res) => {
  try {
    const eventData = req.body;
    await EventService.processEvent(eventData);

    res.status(200).json({
      status: 'success',
      message: 'Event processed successfully'
    });
  } catch (error) {
    logger.error('Error processing event:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Get all notifications (Admin only) - ✅ TEMPORARILY PUBLIC
 * GET /api/notifications
 */
router.get('/', async (req, res) => {  // ❌ Removed 'auth' middleware
  try {
    // ❌ Commented out admin check temporarily
    // if (req.user.role !== ROLES.ADMIN) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: MESSAGES.UNAUTHORIZED
    //   });
    // }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      event_type: req.query.event_type,
      status: req.query.status,
      user_id: req.query.user_id
    };

    const result = await Notification.getAll(page, limit, filters);

    res.status(200).json({
      status: 'success',
      message: MESSAGES.NOTIFICATIONS_FETCHED,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Get unread notifications - ✅ TEMPORARILY PUBLIC
 * GET /api/notifications/unread
 */
router.get('/unread', async (req, res) => {  // ❌ Removed 'auth' middleware
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.getUnread(limit);

    res.status(200).json({
      status: 'success',
      unread_count: notifications.length,
      data: notifications
    });
  } catch (error) {
    logger.error('Error fetching unread notifications:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Get notifications for specific user
 * GET /api/notifications/user/:userId
 */
router.get('/user/:userId', auth, async (req, res) => {  // ✅ Keep auth for user-specific
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (req.user.id !== userId && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: MESSAGES.UNAUTHORIZED
      });
    }

    const result = await Notification.getByUserId(userId, page, limit);

    res.status(200).json({
      status: 'success',
      message: MESSAGES.NOTIFICATIONS_FETCHED,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    logger.error('Error fetching user notifications:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Get notification statistics - ✅ TEMPORARILY PUBLIC
 * GET /api/notifications/stats
 */
router.get('/stats', async (req, res) => {  // ❌ Removed 'auth' middleware
  try {
    // ❌ Commented out admin check temporarily
    // if (req.user.role !== ROLES.ADMIN) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: MESSAGES.UNAUTHORIZED
    //   });
    // }

    const stats = await Notification.getStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Mark notification as read - ✅ TEMPORARILY PUBLIC
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', async (req, res) => {  // ❌ Removed 'auth' middleware
  try {
    const notificationId = parseInt(req.params.id);
    const notification = await Notification.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: MESSAGES.NOT_FOUND
      });
    }

    res.status(200).json({
      status: 'success',
      message: MESSAGES.NOTIFICATION_MARKED_READ,
      data: notification
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Mark all as read - ✅ TEMPORARILY PUBLIC
 * PATCH /api/notifications/read/all
 */
router.patch('/read/all', async (req, res) => {  // ❌ Removed 'auth' middleware
  try {
    const notifications = await Notification.markAllAsRead();

    res.status(200).json({
      status: 'success',
      message: MESSAGES.ALL_MARKED_READ,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', auth, async (req, res) => {  // ✅ Keep auth for delete
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: MESSAGES.UNAUTHORIZED
      });
    }

    const notificationId = parseInt(req.params.id);
    const notification = await Notification.delete(notificationId);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: MESSAGES.NOT_FOUND
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
});

module.exports = router;
