import axios from 'axios';

const AUTH_API_URL = 'http://localhost:5000/api'; // Your auth service URL

// Create axios instance
const api = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Approve a user - Update user status to active
 */
export const approveUser = async (userId) => {
  try {
    const response = await api.patch(`/users/${userId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

/**
 * Reject a user - Update user status to rejected/suspended
 */
export const rejectUser = async (userId, reason = 'Administrative decision') => {
  try {
    const response = await api.patch(`/users/${userId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

/**
 * Get user details by email
 */
export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};
