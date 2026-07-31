const express = require("express");
const router = express.Router();
const controller = require("../controllers/teacherAssignmentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getTeacherAssignments);
router.get("/:id", controller.getTeacherAssignmentById);
router.post("/", controller.createTeacherAssignment);
router.put("/:id", controller.updateTeacherAssignment);
router.delete("/:id", controller.deleteTeacherAssignment);

module.exports = router;
