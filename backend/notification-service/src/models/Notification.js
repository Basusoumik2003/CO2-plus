const { query } = require('../config/database');
const { NOTIFICATION_STATUS } = require('../config/constants');

class Notification {

  /* ================= CREATE ================= */

  static async create(data) {
    const {
      event_type,
      user_id,
      username,
      email,
      user_role,
      ip_address,
      device_info,
      metadata
    } = data;

    const queryText = `
      INSERT INTO notifications 
      (event_type, user_id, username, email, user_role, ip_address, device_info, status, metadata, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await query(queryText, [
      event_type,
      user_id || null,
      username || null,
      email || null,
      user_role || null,
      ip_address || null,
      device_info || null,
      NOTIFICATION_STATUS.NEW,
      JSON.stringify(metadata || {})
    ]);

    return result.rows[0] || null;
  }

  /* ================= ADMIN MAIN VIEW (🔥 NEW) ================= */

  // 👉 Ye function frontend ko ALL REQUIRED DATA dega
  static async getAdminUserView() {
    const queryText = `
      SELECT 
        n.id              AS notification_id,
        n.event_type,
        n.username,
        n.email,
        n.user_role,
        n.ip_address,
        n.device_info,
        n.status          AS notification_status,
        n.created_at,

        u.id              AS user_id,
        u.status          AS user_status
      FROM notifications n
      LEFT JOIN users u ON u.id = n.user_id
      ORDER BY n.created_at DESC
    `;

    const result = await query(queryText);
    return result.rows;
  }

  /* ================= GET ALL ================= */

  static async getAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.event_type) {
      params.push(filters.event_type);
      whereClause += ` AND event_type = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      whereClause += ` AND status = $${params.length}`;
    }

    if (filters.user_id) {
      params.push(filters.user_id);
      whereClause += ` AND user_id = $${params.length}`;
    }

    const countQuery = `SELECT COUNT(*) as count FROM notifications ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count || 0);

    params.push(limit);
    params.push(offset);

    const dataQuery = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await query(dataQuery, params);

    return {
      data: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /* ================= UNREAD ================= */

  static async getUnread(limit = 50) {
    const queryText = `
      SELECT * FROM notifications
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [NOTIFICATION_STATUS.NEW, limit]);
    return result.rows;
  }

  /* ================= BY USER ================= */

  static async getByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1';
    const countResult = await query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const dataQuery = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(dataQuery, [userId, limit, offset]);

    return {
      data: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /* ================= SINGLE ================= */

  static async getById(notificationId) {
    const queryText = 'SELECT * FROM notifications WHERE id = $1';
    const result = await query(queryText, [notificationId]);
    return result.rows[0] || null;
  }

  /* ================= READ ================= */

  static async markAsRead(notificationId) {
    const queryText = `
      UPDATE notifications
      SET status = $1, read_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(queryText, [NOTIFICATION_STATUS.READ, notificationId]);
    return result.rows[0] || null;
  }

  static async markAllAsRead() {
    const queryText = `
      UPDATE notifications
      SET status = $1, read_at = CURRENT_TIMESTAMP
      WHERE status = $2
      RETURNING *
    `;

    const result = await query(queryText, [
      NOTIFICATION_STATUS.READ,
      NOTIFICATION_STATUS.NEW
    ]);

    return result.rows;
  }

  /* ================= DELETE ================= */

  static async delete(notificationId) {
    const queryText = 'DELETE FROM notifications WHERE id = $1 RETURNING *';
    const result = await query(queryText, [notificationId]);
    return result.rows[0] || null;
  }

  /* ================= STATS (FIXED) ================= */

  static async getStats(hoursBack = 24) {
    const queryText = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = $1 THEN 1 END) as unread,
        COUNT(CASE WHEN event_type = $2 THEN 1 END) as signups,
        COUNT(CASE WHEN event_type = $3 THEN 1 END) as logins,
        COUNT(CASE WHEN event_type = $4 THEN 1 END) as failed_attempts,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour
      FROM notifications
      WHERE created_at > NOW() - ($5 || ' hours')::INTERVAL
    `;

    const result = await query(queryText, [
      NOTIFICATION_STATUS.NEW,
      'signup',
      'login',
      'failed_login',
      hoursBack
    ]);

    return result.rows[0] || {};
  }
}

module.exports = Notification;
