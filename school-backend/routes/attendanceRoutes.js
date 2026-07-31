const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", attendanceController.getAttendance);
router.post("/", attendanceController.submitAttendance);

module.exports = router;
