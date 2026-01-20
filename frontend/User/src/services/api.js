import {
  authApiClient,
  assetApiClient,
  notificationApiClient
} from './apiClient';

/**
 * =========================
 * Authentication Service
 * =========================
 */
export const authService = {
  login: async (email, password) => {
    const response = await authApiClient.post('/api/auth/login', {
      email,
      password,
    });
    console.log('🟢 Login Response:', response.data);
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await authApiClient.post('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  logout: async () => {
    try {
      const response = await authApiClient.post('/api/auth/logout');
      localStorage.removeItem('authToken');
      return response.data;
    } catch {
      localStorage.removeItem('authToken');
    }
  },

  refreshToken: async () => {
    const response = await authApiClient.post('/api/auth/refresh');
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
};

/**
 * =========================
 * Asset Service
 * =========================
 */
export const assetService = {
  getAllAssetStatuses: async (userId) => {
    const response = await assetApiClient.get(
      `/assets/user/${userId}/status`
    );
    return response.data;
  },

  getHealthCheck: async () => {
    const response = await assetApiClient.get('/health');
    return response.data;
  },

  createAsset: async (assetData) => {
    const response = await assetApiClient.post('/assets', assetData);
    return response.data;
  },

  updateAsset: async (assetId, assetData) => {
    const response = await assetApiClient.put(
      `/assets/${assetId}`,
      assetData
    );
    return response.data;
  },
};

/**
 * =========================
 * Notification Service
 * =========================
 */
export const notificationService = {
  getNotifications: async (filters = {}) => {
    const response = await notificationApiClient.get(
      '/api/notifications',
      { params: filters }
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await notificationApiClient.get(
      '/api/notifications/unread'
    );
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await notificationApiClient.patch(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await notificationApiClient.patch(
      '/api/notifications/read/all'
    );
    return response.data;
  },
};

export default {
  authService,
  assetService,
  notificationService,
};
