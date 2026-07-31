const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollmentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getEnrollments);
router.get("/student/:studentId/history", controller.getStudentEnrollmentHistory);
router.get("/:id", controller.getEnrollmentById);
router.post("/", controller.createEnrollment);
router.put("/:id", controller.updateEnrollment);
router.delete("/:id", controller.deleteEnrollment);

module.exports = router;
