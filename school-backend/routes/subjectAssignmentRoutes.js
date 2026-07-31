const express = require("express");
const router = express.Router();
const controller = require("../controllers/subjectAssignmentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getSubjectAssignments);
router.get("/:id", controller.getSubjectAssignmentById);
router.post("/", controller.createSubjectAssignment);
router.put("/:id", controller.updateSubjectAssignment);
router.delete("/:id", controller.deleteSubjectAssignment);

module.exports = router;
