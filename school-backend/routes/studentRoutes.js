const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const authorizeOwnership = require("../middleware/authorizeOwnership");
const ROLE = require("../config/roles");
const { validateStudent, validateUpdateStudent } = require("../validators/studentValidator");

router.get("/toppers", studentController.getToppers);
router.get("/search", verifyToken, verifyAdmin, studentController.searchStudents);
router.get("/", verifyToken, verifyAdmin, studentController.getStudents);

// GET student by ID - Admins, Teachers, or Student owners
router.get("/:id", verifyToken, authorizeOwnership({ allowedRoles: [ROLE.ADMIN, ROLE.TEACHER, ROLE.STUDENT], strategy: "student" }), studentController.getStudentById);

// PUT student update - Admins or Student owners
router.put("/:id", verifyToken, authorizeOwnership({ allowedRoles: [ROLE.ADMIN, ROLE.STUDENT], strategy: "student" }), validateUpdateStudent, studentController.updateStudent);

router.post("/", verifyToken, verifyAdmin, validateStudent, studentController.createStudent);
router.delete("/:id", verifyToken, verifyAdmin, studentController.deleteStudent);

module.exports = router;
