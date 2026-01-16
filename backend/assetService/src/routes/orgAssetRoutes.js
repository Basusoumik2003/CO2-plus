const express = require("express");
const router = express.Router();

const {
  createOrgAsset,
  getAllOrgAssets,
  getOrgAssetsByUser,
  getOrgAssetsByStatus,
  updateOrgAssetStatus,
  deleteOrgAsset,
} = require("../controllers/orgAssetController");

/**
 * ORG ASSET ROUTES
 */
router.post("/", createOrgAsset);
router.get("/", getAllOrgAssets);
router.get("/status", getOrgAssetsByStatus);
router.get("/user/:u_id", getOrgAssetsByUser);
router.put("/:id/status", updateOrgAssetStatus);
router.delete("/:id", deleteOrgAsset);

module.exports = router;
