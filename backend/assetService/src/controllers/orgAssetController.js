const { query } = require("../config/database");

/* =========================================================
   CREATE ORG ASSET
========================================================= */
const createOrgAsset = async (req, res) => {
  try {
    const {
      plantationId,
      t_oid,
      u_id,
      location_lat,
      location_long,
      area_hactare,
      species_Name,
      trees_planted,
      avg_height,
      avg_dbh,
      survival_rate,
      plantation_date,
      Base_line_Land,
      ImageId,
    } = req.body;

    const userCheck = await query(
      `SELECT u_id FROM users WHERE u_id = $1`,
      [u_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (ImageId) {
      const imageCheck = await query(
        `SELECT image_id FROM tree_images WHERE image_id = $1`,
        [ImageId]
      );

      if (imageCheck.rows.length === 0) {
        return res.status(404).json({ error: "Image not found" });
      }
    }

    const sql = `
      INSERT INTO org_assets (
        plantation_id,
        t_oid,
        u_id,
        location_lat,
        location_long,
        area_hactare,
        species_name,
        trees_planted,
        avg_height,
        avg_dbh,
        survival_rate,
        plantation_date,
        base_line_land,
        image_id,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending'
      )
      RETURNING *
    `;

    const values = [
      plantationId,
      t_oid,
      u_id,
      location_lat,
      location_long,
      area_hactare,
      species_Name,
      trees_planted,
      avg_height,
      avg_dbh,
      survival_rate,
      plantation_date,
      Base_line_Land,
      ImageId,
    ];

    const { rows } = await query(sql, values);

    res.status(201).json({
      success: true,
      message: "Org asset created successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create org asset" });
  }
};

/* =========================================================
   GET ALL ORG ASSETS
========================================================= */
const getAllOrgAssets = async (req, res) => {
  try {
    const sql = `
      SELECT
        oa.*,
        ti.image_url
      FROM org_assets oa
      LEFT JOIN tree_images ti 
        ON ti.image_id = oa.image_id
      ORDER BY oa.created_at DESC
    `;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch org assets" });
  }
};

const getOrgAssetsByUser = async (req, res) => {
  try {
    const { u_id } = req.params;

    const sql = `
      SELECT *
      FROM org_assets
      WHERE u_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await query(sql, [u_id]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch org assets" });
  }
};

const getOrgAssetsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const sql = `
      SELECT plantation_id, u_id, species_name, trees_planted, status, created_at
      FROM org_assets
      WHERE status = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await query(sql, [status]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch org assets by status" });
  }
};

const updateOrgAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await query(
      `UPDATE org_assets SET status = $1 WHERE plantation_id = $2`,
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

const deleteOrgAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM org_assets WHERE plantation_id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

const getOrgAssetsForWorkflow = async (req, res) => {
  try {
    const sql = `
      SELECT
        plantation_id AS id,
        'TREE' AS type,
        status,
        u_id,
        created_at AS submitted_on,
        'organisation' AS submittedByType
      FROM org_assets
      ORDER BY created_at DESC
    `;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load org workflow assets" });
  }
};

const getApprovedOrgAssets = async (req, res) => {
  try {
    const sql = `
      SELECT
        oa.plantation_id AS id,
        oa.u_id,
        oa.status,
        oa.created_at,
        'organisation' AS submittedByType,
        'TREE' AS type,
        ti.image_id,
        ti.image_url
      FROM org_assets oa
      LEFT JOIN tree_images ti ON ti.image_id = oa.image_id
      WHERE oa.status = 'approved'
      ORDER BY oa.created_at DESC
    `;

    const { rows } = await query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch org assets" });
  }
};

const getOrgAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `SELECT * FROM org_assets WHERE plantation_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Org asset not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch org asset details" });
  }
};

module.exports = {
  createOrgAsset,
  getAllOrgAssets,
  getOrgAssetsByUser,
  getOrgAssetsByStatus,
  updateOrgAssetStatus,
  deleteOrgAsset,
  getOrgAssetsForWorkflow,
  getApprovedOrgAssets,
  getOrgAssetById,
};
