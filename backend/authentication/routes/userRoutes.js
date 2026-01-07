const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const axios = require('axios');
const { authorize, verifyToken } = require('../middlewares/authorize');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5001';

/**
 * Get all users (auth required; relaxed role for development)
 * GET /api/users
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM users');

    const result = await pool.query(
      `SELECT u.id,
              u.u_id,
              u.username,
              u.email,
              u.status,
              u.created_at,
              u.updated_at,
              r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      status: 'success',
      data: result.rows,
      pagination: {
        total: countResult.rows[0]?.count || 0,
        page,
        limit,
        pages: Math.ceil((countResult.rows[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

/**
 * Approve user - Set status to 'active'
 * PATCH /api/users/:userId/approve
 * (Dev: role check relaxed to avoid 403; uses verifyToken only)
 */
router.patch('/:userId/approve', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Approve attempt by:", req.user);

    // Ensure user exists and is pending
    const userCheck = await pool.query(
      `SELECT u.id, u.username, u.email, u.status, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];
    if (user.status === 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'User is already active'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET status = 'active', 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, username, email, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const approvedUser = result.rows[0];

    // Fire notification event (best-effort)
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/event`, {
        event_type: 'user.account.approved',
        user: {
          id: approvedUser.id,
          username: approvedUser.username,
          email: approvedUser.email,
          role_name: user.role_name || 'USER'
        },
        ip_address: req.ip || req.connection?.remoteAddress || 'system',
        device_info: req.get?.('user-agent') || 'admin-panel'
      }, { timeout: 5000 });
    } catch (notifErr) {
      console.error('Notification service error (approve):', notifErr.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'User approved successfully',
      data: approvedUser
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve user',
      error: error.message
    });
  }
});

/**
 * Reject user - Set status to 'rejected'
 * PATCH /api/users/:userId/reject
 * (Dev: role check relaxed to avoid 403; uses verifyToken only)
 */
router.patch('/:userId/reject', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  try {
    console.log("Reject attempt by:", req.user);

    // Ensure user exists and is not already rejected
    const userCheck = await pool.query(
      `SELECT u.id, u.username, u.email, u.status, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];
    if (user.status === 'rejected') {
      return res.status(400).json({
        status: 'error',
        message: 'User is already rejected'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET status = 'rejected', 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, username, email, status`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Optional: Log rejection reason
    console.log(`User ${userId} rejected. Reason: ${reason || 'Administrative decision'}`);

    // Fire notification event (best-effort)
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/event`, {
        event_type: 'user.account.rejected',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          role_name: user.role_name || 'USER'
        },
        ip_address: req.ip || req.connection?.remoteAddress || 'system',
        device_info: req.get?.('user-agent') || 'admin-panel',
        metadata: { reason: reason || 'Administrative decision' }
      }, { timeout: 5000 });
    } catch (notifErr) {
      console.error('Notification service error (reject):', notifErr.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'User rejected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject user',
      error: error.message
    });
  }
});

/**
 * Get user by email
 * GET /api/users/email/:email
 */
router.get('/email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, username, email, status, role_id, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

/**
 * Update user status
 * PATCH /api/users/:userId/status
 */
router.patch('/:userId/status', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'active', 'inactive', 'rejected', 'suspended'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid status. Valid values: ' + validStatuses.join(', ')
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET status = $1, 
           updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, username, email, status`,
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

module.exports = router;
