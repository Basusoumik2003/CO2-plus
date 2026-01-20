const { query } = require("../config/database");

/* =========================================================
   METRICS (summary cards)
========================================================= */
const getMetrics = async (req, res) => {
  try {
    const sql = `
      SELECT
        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'approved') +
          (SELECT COUNT(*) FROM trees WHERE status = 'approved') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'approved') +
          (SELECT COUNT(*) FROM org_assets WHERE status = 'approved')
        ) AS "approved",

        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'rejected') +
          (SELECT COUNT(*) FROM trees WHERE status = 'rejected') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'rejected') +
          (SELECT COUNT(*) FROM org_assets WHERE status = 'rejected')
        ) AS "rejected",

        (
          (SELECT COUNT(*) FROM ev_master_data WHERE status = 'pending') +
          (SELECT COUNT(*) FROM trees WHERE status = 'pending') +
          (SELECT COUNT(*) FROM solar_panels WHERE status = 'pending') +
          (SELECT COUNT(*) FROM org_assets WHERE status = 'pending')
        ) AS "pendingReview",

        (SELECT COUNT(*) FROM ev_master_data WHERE status = 'approved') AS "totalEV",
        (
          (SELECT COUNT(*) FROM trees WHERE status = 'approved') +
          (SELECT COUNT(*) FROM org_assets WHERE status = 'approved')
        ) AS "totalTrees",
        (SELECT COUNT(*) FROM solar_panels WHERE status = 'approved') AS "totalSolar"
    `;

    const { rows } = await query(sql);
    res.json(rows[0]);
  } catch (err) {
    console.error("METRICS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

/* =========================================================
   WORKFLOW (pending review list)
========================================================= */
const getWorkflowAssets = async (req, res) => {
  try {
    const sql = `
SELECT
  ev_id::text AS id,
  'EV' AS type,
  u_id::text AS u_id,
  status::text AS status,
  created_at AS submitted_on,
  'individual' AS submittedByType
FROM ev_master_data
WHERE status IN ('pending','pending_approval')

UNION ALL

SELECT
  tid::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  status::text AS status,
  created_at AS submitted_on,
  'individual' AS submittedByType
FROM trees
WHERE status IN ('pending','pending_approval')

UNION ALL

SELECT
  suid::text AS id,
  'SOLAR' AS type,
  u_id::text AS u_id,
  status::text AS status,
  created_at AS submitted_on,
  'individual' AS submittedByType
FROM solar_panels
WHERE status IN ('pending','pending_approval')

UNION ALL

SELECT
  plantation_id::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  status::text AS status,
  created_at AS submitted_on,
  'organisation' AS submittedByType
FROM org_assets
WHERE status IN ('pending','pending_approval')

ORDER BY submitted_on DESC;
`;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    console.error("WORKFLOW ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   APPROVED ASSETS
========================================================= */
const getApprovedAssets = async (req, res) => {
  try {
    const sql = `
SELECT
  ev_id::text AS id,
  'EV' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM ev_master_data
WHERE status = 'approved'

UNION ALL

SELECT
  tid::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM trees
WHERE status = 'approved'

UNION ALL

SELECT
  suid::text AS id,
  'SOLAR' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM solar_panels
WHERE status = 'approved'

UNION ALL

SELECT
  plantation_id::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  created_at,
  'organisation' AS submittedByType
FROM org_assets
WHERE status = 'approved'

ORDER BY created_at DESC;
`;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    console.error("APPROVED ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   APPROVE / REJECT
========================================================= */
const updateAssetStatus = async (req, res) => {
  try {
    const { id, type } = req.params;
    const { status } = req.body;

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

/* =========================================================
   REJECTED ASSETS
========================================================= */
const getRejectedAssets = async (req, res) => {
  try {
    const sql = `
SELECT
  ev_id::text AS id,
  'EV' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM ev_master_data
WHERE status = 'rejected'

UNION ALL

SELECT
  tid::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM trees
WHERE status = 'rejected'

UNION ALL

SELECT
  suid::text AS id,
  'SOLAR' AS type,
  u_id::text AS u_id,
  created_at,
  'individual' AS submittedByType
FROM solar_panels
WHERE status = 'rejected'

UNION ALL

SELECT
  plantation_id::text AS id,
  'TREE' AS type,
  u_id::text AS u_id,
  created_at,
  'organisation' AS submittedByType
FROM org_assets
WHERE status = 'rejected'

ORDER BY created_at DESC
`;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    console.error("REJECTED ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ASSET DETAILS
========================================================= */
const getAssetDetails = async (req, res) => {
  try {
    const { type, id } = req.params;

    let sql = "";

    if (type === "ev") {
      sql = `SELECT * FROM ev_master_data WHERE ev_id = $1`;
    }

    if (type === "tree") {
      sql = `SELECT * FROM trees WHERE tid = $1`;
    }

    if (type === "solar") {
      sql = `SELECT * FROM solar_panels WHERE suid = $1`;
    }

    const { rows } = await query(sql, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch asset details" });
  }
};

/* ================= EXPORTS ================= */
module.exports = {
  getMetrics,
  getWorkflowAssets,
  getApprovedAssets,
  getRejectedAssets,
  updateAssetStatus,
  getAssetDetails,
};
