const express = require("express");
const router = express.Router();
const controller = require("../controllers/academicYearController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getAcademicYears);
router.get("/current", controller.getCurrentYear);
router.get("/:id", controller.getAcademicYearById);
router.post("/", controller.createAcademicYear);
router.put("/:id", controller.updateAcademicYear);
router.delete("/:id", controller.deleteAcademicYear);

module.exports = router;
