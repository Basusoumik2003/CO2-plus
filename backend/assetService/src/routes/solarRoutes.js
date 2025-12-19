const express = require("express");
const router = express.Router();
const SolarController = require("../controllers/solarController");
const {
  validateUserId,
  verifyAssetOwnership,
  logUserAction,
} = require("../middleware/auth");

/**
 * Solar Panel Routes
 * Base URL: /api/solarpanel
 */

// Create new Solar Panel
router.post(
  "/",
  validateUserId,
  logUserAction("CREATE_SOLAR"),
  SolarController.createSolar
);

// Get all Solar Panels for a user
router.get(
  "/:userId",
  validateUserId,
  logUserAction("GET_USER_SOLAR"),
  SolarController.getSolarByUser
);

// Get single Solar Panel by ID
router.get(
  "/single/:suid",
  logUserAction("GET_SOLAR_DETAILS"),
  SolarController.getSolarById
);

// Update Solar Panel
router.put(
  "/:suid",
  validateUserId,
  verifyAssetOwnership("solar"),
  logUserAction("UPDATE_SOLAR"),
  SolarController.updateSolar
);

// Delete Solar Panel
router.delete(
  "/:suid",
  validateUserId,
  verifyAssetOwnership("solar"),
  logUserAction("DELETE_SOLAR"),
  SolarController.deleteSolar
);

// Update Solar Panel status (Admin only)
router.patch(
  "/:suid/status",
  logUserAction("UPDATE_SOLAR_STATUS"),
  SolarController.updateSolarStatus
);

module.exports = router;
