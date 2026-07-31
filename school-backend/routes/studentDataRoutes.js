const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const verifyToken = require("../middleware/verifyToken");

router.get("/dashboard", verifyToken, studentController.getStudentDashboard);
router.put("/profile", verifyToken, studentController.updateStudentDashboardProfile);
router.post("/assignments/:assignmentId/submit", verifyToken, studentController.submitAssignment);

module.exports = router;
