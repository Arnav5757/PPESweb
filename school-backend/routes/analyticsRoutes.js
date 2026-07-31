const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/", verifyToken, verifyAdmin, analyticsController.getAnalytics);

module.exports = router;
