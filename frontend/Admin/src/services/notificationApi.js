import axios from 'axios';

const NOTIFICATION_API_URL = 'http://localhost:5001/api/notifications';

// Fetch all notifications with filters
export const fetchNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${NOTIFICATION_API_URL}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Fetch unread notifications count
export const fetchUnreadCount = async () => {
  try {
    const response = await axios.get(`${NOTIFICATION_API_URL}/unread`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Fetch notification stats
export const fetchNotificationStats = async () => {
  try {
    const response = await axios.get(`${NOTIFICATION_API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(`${NOTIFICATION_API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
};

// Mark all as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.patch(`${NOTIFICATION_API_URL}/read/all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};
