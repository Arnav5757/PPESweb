const express = require("express");
const router = express.Router();
const controller = require("../controllers/academicSubjectController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getAcademicSubjects);
router.get("/:id", controller.getAcademicSubjectById);
router.post("/", controller.createAcademicSubject);
router.put("/:id", controller.updateAcademicSubject);
router.delete("/:id", controller.deleteAcademicSubject);

module.exports = router;
