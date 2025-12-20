const express = require("express");
const router = express.Router();
const EVController = require("../controllers/evController");
const {
  validateUserId,
  verifyAssetOwnership,
  logUserAction,
} = require("../middleware/auth");

/**
 * EV Routes
 * Base URL: /api/evmasterdata
 */

// Create new EV
router.post(
  "/",
  validateUserId,
  logUserAction("CREATE_EV"),
  EVController.createEV
);

// Get all EVs for a user
router.get(
  "/:userId",
  validateUserId,
  logUserAction("GET_USER_EVS"),
  EVController.getEVsByUser
);

// Get single EV by ID
router.get(
  "/single/:ev_id",
  logUserAction("GET_EV_DETAILS"),
  EVController.getEVById
);

// Update EV
router.put(
  "/:ev_id",
  validateUserId,
  verifyAssetOwnership("ev"),
  logUserAction("UPDATE_EV"),
  EVController.updateEV
);

// Delete EV
router.delete(
  "/:ev_id",
  validateUserId,
  verifyAssetOwnership("ev"),
  logUserAction("DELETE_EV"),
  EVController.deleteEV
);

// Update EV status (Admin only - can add admin middleware later)
router.patch(
  "/:ev_id/status",
  logUserAction("UPDATE_EV_STATUS"),
  EVController.updateEVStatus
);

module.exports = router;
