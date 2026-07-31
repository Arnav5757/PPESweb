const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", activityLogController.getActivityLogs);

module.exports = router;
