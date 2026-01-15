const express = require("express");
const router = express.Router();

const {
  createOrgAsset,
  getAllOrgAssets,
  getOrgAssetById,
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
router.get("/:id", getOrgAssetById);
router.put("/:id/status", updateOrgAssetStatus);
router.delete("/:id", deleteOrgAsset);

module.exports = router;
