const express = require("express");
const router = express.Router();
const cmsController = require("../controllers/cmsController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Public access for reading CMS content
router.get("/", cmsController.getCMS);

// Admin-only updates
router.post("/", verifyToken, verifyAdmin, cmsController.saveCMS);

module.exports = router;
