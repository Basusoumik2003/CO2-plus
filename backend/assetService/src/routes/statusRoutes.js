const express = require("express");
const router = express.Router();
const StatusController = require("../controllers/statusController");
const { validateUserId, logUserAction } = require("../middleware/auth");

/**
 * Asset Status Routes
 * Base URL: /api/assets
 */

// Get all asset statuses for a user
router.get(
  "/user/:userId/status",
  validateUserId,
  logUserAction("GET_ASSET_STATUSES"),
  StatusController.getUserAssetStatuses
);

module.exports = router;
