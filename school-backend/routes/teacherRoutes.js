const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const authorizeOwnership = require("../middleware/authorizeOwnership");
const ROLE = require("../config/roles");

router.use(verifyToken);

// GET / -> admin only
router.get("/", verifyAdmin, teacherController.getTeachers);

// POST / -> admin only
router.post("/", verifyAdmin, teacherController.createTeacher);

// GET /:id -> admin or the teacher themselves
router.get("/:id", authorizeOwnership({ allowedRoles: [ROLE.ADMIN, ROLE.TEACHER], strategy: "teacher" }), teacherController.getTeacherById);

// PUT /:id -> admin or the teacher themselves
router.put("/:id", authorizeOwnership({ allowedRoles: [ROLE.ADMIN, ROLE.TEACHER], strategy: "teacher" }), teacherController.updateTeacher);

// DELETE /:id -> admin only
router.delete("/:id", verifyAdmin, teacherController.deleteTeacher);

module.exports = router;
