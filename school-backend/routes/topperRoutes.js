const express = require("express");
const router = express.Router();
const topperController = require("../controllers/topperController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Public routes
router.get("/", topperController.getToppers);

// Protected routes (Admin only)
router.post("/", verifyToken, verifyAdmin, topperController.createTopper);
router.put("/:id", verifyToken, verifyAdmin, topperController.updateTopper);
router.delete("/:id", verifyToken, verifyAdmin, topperController.deleteTopper);

module.exports = router;
