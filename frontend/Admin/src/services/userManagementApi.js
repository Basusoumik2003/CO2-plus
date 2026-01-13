import authClient from '../api/authClient';

/* ✅ GET ALL USERS */
export const fetchAllUsers = () =>
  authClient
    .get('/api/users')
    .then(res => res.data?.data || [])   // 👈 MAIN FIX
    .catch((err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        console.warn('Users fetch unauthorized/forbidden; returning empty list.');
        return [];
      }
      throw err;
    });

/* ✅ APPROVE USER */
export const approveUser = (userId) =>
  authClient
    .patch(`/api/users/${userId}/approve`)
    .then(res => res.data);

/* ✅ REJECT USER */
export const rejectUser = (userId, reason = 'Administrative decision') =>
  authClient
    .patch(`/api/users/${userId}/reject`, { reason })
    .then(res => res.data);

/* ✅ GET USER BY EMAIL */
export const getUserByEmail = (email) =>
  authClient
    .get(`/api/users/email/${email}`)
    .then(res => res.data?.data || res.data);

/* ✅ UPDATE STATUS (optional) */
export const updateUserStatus = (userId, status) =>
  authClient
    .patch(`/api/users/${userId}/status`, { status })
    .then(res => res.data);
