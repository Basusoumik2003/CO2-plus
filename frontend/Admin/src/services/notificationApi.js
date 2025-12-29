import apiClient from './apiClient';

const NOTIFICATION_API_URL = '/api/notifications';

/**
 * Fetch all notifications with filters
 * @param {Object} filters - Filter parameters (status, event_type, user_id, page, limit)
 * @returns {Promise<Object>} Notifications data with pagination
 */
export const fetchNotifications = async (filters = {}) => {
  try {
    const response = await apiClient.get(NOTIFICATION_API_URL, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Fetch unread notifications count
 * @returns {Promise<Object>} Unread notifications list
 */
export const fetchUnreadCount = async () => {
  try {
    const response = await apiClient.get(`${NOTIFICATION_API_URL}/unread`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Fetch notification statistics
 * @returns {Promise<Object>} Statistics data
 */
export const fetchNotificationStats = async () => {
  try {
    const response = await apiClient.get(`${NOTIFICATION_API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Get notifications for specific user
 * @param {number} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} User notifications
 */
export const fetchUserNotifications = async (userId, options = {}) => {
  try {
    const response = await apiClient.get(`${NOTIFICATION_API_URL}/user/${userId}`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Mark single notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(
      `${NOTIFICATION_API_URL}/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Updated notifications
 */
export const markAllAsRead = async () => {
  try {
    const response = await apiClient.patch(`${NOTIFICATION_API_URL}/read/all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete notification (Admin only)
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Deleted notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(
      `${NOTIFICATION_API_URL}/${notificationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export default {
  fetchNotifications,
  fetchUnreadCount,
  fetchNotificationStats,
  fetchUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
