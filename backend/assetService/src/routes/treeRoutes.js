const express = require("express");
const router = express.Router();
const TreeController = require("../controllers/treeController");
const {
  validateUserId,
  verifyAssetOwnership,
  logUserAction,
} = require("../middleware/auth");

/**
 * Tree Routes
 * Base URL: /api/tree
 */

// Create new Tree
router.post(
  "/",
  validateUserId,
  logUserAction("CREATE_TREE"),
  TreeController.createTree
);

// Get all Trees for a user
router.get(
  "/:userId",
  validateUserId,
  logUserAction("GET_USER_TREES"),
  TreeController.getTreesByUser
);

// Get single Tree by ID
router.get(
  "/single/:tid",
  logUserAction("GET_TREE_DETAILS"),
  TreeController.getTreeById
);

// Update Tree
router.put(
  "/:tid",
  validateUserId,
  verifyAssetOwnership("tree"),
  logUserAction("UPDATE_TREE"),
  TreeController.updateTree
);

// Delete Tree
router.delete(
  "/:tid",
  validateUserId,
  verifyAssetOwnership("tree"),
  logUserAction("DELETE_TREE"),
  TreeController.deleteTree
);

// Add image to Tree
router.post(
  "/:tid/image",
  validateUserId,
  verifyAssetOwnership("tree"),
  logUserAction("ADD_TREE_IMAGE"),
  TreeController.addTreeImage
);

// Delete Tree image
router.delete(
  "/image/:imageId",
  logUserAction("DELETE_TREE_IMAGE"),
  TreeController.deleteTreeImage
);

// Update Tree status (Admin only)
router.patch(
  "/:tid/status",
  logUserAction("UPDATE_TREE_STATUS"),
  TreeController.updateTreeStatus
);

module.exports = router;
