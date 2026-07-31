const express = require("express");
const router = express.Router();
const controller = require("../controllers/classController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getClasses);
router.get("/:id", controller.getClassById);
router.get("/:id/sections", controller.getClassSections);
router.get("/:id/subjects", controller.getClassSubjects);
router.get("/:id/enrollments", controller.getClassEnrollments);
router.post("/", controller.createClass);
router.put("/:id", controller.updateClass);
router.delete("/:id", controller.deleteClass);

module.exports = router;
