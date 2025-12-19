const { query } = require("../config/database");

class TransactionModel {
  /**
   * Create EV transaction
   */
  static async createEVTransaction(transactionData) {
    const { ev_id, active_distance } = transactionData;

    const queryText = `
      INSERT INTO ev_transactions (ev_id, active_distance)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await query(queryText, [ev_id, active_distance]);
    return result.rows[0];
  }

  /**
   * Get all transactions for an EV
   */
  static async getByEvId(evId) {
    const queryText = `
      SELECT * FROM ev_transactions 
      WHERE ev_id = $1 
      ORDER BY created_date DESC
    `;
    const result = await query(queryText, [evId]);
    return result.rows;
  }

  /**
   * Get transaction by ID
   */
  static async getById(tranId) {
    const queryText = `
      SELECT * FROM ev_transactions 
      WHERE ev_tran_id = $1
    `;
    const result = await query(queryText, [tranId]);
    return result.rows[0];
  }

  /**
   * Delete transaction
   */
  static async delete(tranId) {
    const queryText = `
      DELETE FROM ev_transactions 
      WHERE ev_tran_id = $1
      RETURNING *
    `;
    const result = await query(queryText, [tranId]);
    return result.rows[0];
  }

  /**
   * Get total distance for EV
   */
  static async getTotalDistance(evId) {
    const queryText = `
      SELECT COALESCE(SUM(active_distance), 0) as total_distance
      FROM ev_transactions 
      WHERE ev_id = $1
    `;
    const result = await query(queryText, [evId]);
    return parseFloat(result.rows[0].total_distance);
  }
}

module.exports = TransactionModel;
