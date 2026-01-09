import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { query } = require("../config/database.js");

/* =========================================================
   METRICS (summary cards)
========================================================= */
export const getMetrics = async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM ev_master_data WHERE status = 'approved') AS "totalEV",
        (SELECT COUNT(*) FROM trees WHERE status = 'approved') AS "totalTrees",
        (SELECT COUNT(*) FROM solar_panels WHERE status = 'approved') AS "totalSolar",

        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'pending') +
          (SELECT COUNT(*) FROM trees WHERE status = 'pending') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'pending')
        ) AS "pendingReview",

        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'approved') +
          (SELECT COUNT(*) FROM trees WHERE status = 'approved') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'approved')
        ) AS "approved",

        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'rejected') +
          (SELECT COUNT(*) FROM trees WHERE status = 'rejected') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'rejected')
        ) AS "rejected"
    `;

    const { rows } = await query(sql);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

/* =========================================================
   WORKFLOW (pending review list)
========================================================= */
export const getWorkflowAssets = async (req, res) => {
  try {
    const sql = `
      SELECT
        ev_id AS id,
        'EV' AS type,
        u_id,
        status,
        created_at AS submitted_on
      FROM ev_master_data
      WHERE status = 'pending'

      UNION ALL

      SELECT
        tid AS id,
        'TREE' AS type,
        u_id,
        status,
        created_at AS submitted_on
      FROM trees
      WHERE status = 'pending'

      UNION ALL

      SELECT
        suid AS id,
        'SOLAR' AS type,
        u_id,
        status,
        created_at AS submitted_on
      FROM solar_panels
      WHERE status = 'pending'

      ORDER BY submitted_on DESC
    `;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workflow assets" });
  }
};



/* =========================================================
   APPROVED ASSETS (filter by type)
========================================================= */
export const getApprovedAssets = async (req, res) => {
  try {
    const { type } = req.query;

    let sql = "";
    let params = [];

    if (!type || type === "all") {
      sql = `
        SELECT ev_id AS id, 'EV' AS type, u_id, created_at
        FROM ev_master_data WHERE status = 'approved'
        UNION ALL
        SELECT tid AS id, 'TREE' AS type, u_id, created_at
        FROM trees WHERE status = 'approved'
        UNION ALL
        SELECT suid AS id, 'SOLAR' AS type, u_id, created_at
        FROM solar_panels WHERE status = 'approved'
        ORDER BY created_at DESC
      `;
    } else if (type === "ev") {
      sql = `SELECT ev_id AS id, 'EV' AS type, u_id, created_at
             FROM ev_master_data WHERE status = 'approved'`;
    } else if (type === "tree") {
      sql = `SELECT tid AS id, 'TREE' AS type, u_id, created_at
             FROM trees WHERE status = 'approved'`;
    } else if (type === "solar") {
      sql = `SELECT suid AS id, 'SOLAR' AS type, u_id, created_at
             FROM solar_panels WHERE status = 'approved'`;
    }

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved assets" });
  }
};



/* =========================================================
   APPROVE / REJECT
========================================================= */
export const updateAssetStatus = async (req, res) => {
  try {
    const { id, type } = req.params; // type = ev | tree | solar
    const { status } = req.body;     // approved | rejected

    let sql = "";

    if (type === "ev") {
      sql = `UPDATE ev_master_data SET status=$1 WHERE ev_id=$2`;
    } else if (type === "tree") {
      sql = `UPDATE trees SET status=$1 WHERE tid=$2`;
    } else if (type === "solar") {
      sql = `UPDATE solar_panels SET status=$1 WHERE suid=$2`;
    } else {
      return res.status(400).json({ error: "Invalid asset type" });
    }

    await query(sql, [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
};


export const getRejectedAssets = async (req, res) => {
  const sql = `
    SELECT ev_id AS id, 'EV' AS type, u_id, created_at
    FROM ev_master_data WHERE status = 'rejected'
    UNION ALL
    SELECT tid AS id, 'TREE' AS type, u_id, created_at
    FROM trees WHERE status = 'rejected'
    UNION ALL
    SELECT suid AS id, 'SOLAR' AS type, u_id, created_at
    FROM solar_panels WHERE status = 'rejected'
    ORDER BY created_at DESC
  `;
  const { rows } = await query(sql);
  res.json(rows);
};


export const getAssetDetails = async (req, res) => {
  try {
    const { type, id } = req.params;

    let sql = "";

    if (type === "ev") {
      sql = `
        SELECT
          ev_id,
          u_id,
          category,
          manufacturers,
          model,
          purchase_year,
          energy_consumed,
          primary_charging_type,
          range,
          grid_emission_factor,
          top_speed,
          charging_time,
          motor_power,
          status,
          created_at
        FROM ev_master_data
        WHERE ev_id = $1
      `;
    }

    if (type === "tree") {
      sql = `
        SELECT
          tid,
          u_id,
          treename,
          botanicalname,
          plantingdate,
          height,
          dbh,
          location,
          created_by,
          status,
          created_at
        FROM trees
        WHERE tid = $1
      `;
    }

    if (type === "solar") {
      sql = `
        SELECT
          suid,
          u_id,
          installed_capacity,
          installation_date,
          energy_generation_value,
          grid_emission_factor,
          inverter_type,
          status,
          created_at
        FROM solar_panels
        WHERE suid = $1
      `;
    }

    const { rows } = await query(sql, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch asset details" });
  }
};
