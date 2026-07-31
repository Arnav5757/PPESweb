const express = require("express");
const router = express.Router();
const controller = require("../controllers/academicSessionController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getAcademicSessions);
router.get("/current", controller.getCurrentSession);
router.get("/:id", controller.getAcademicSessionById);
router.post("/", controller.createAcademicSession);
router.put("/:id", controller.updateAcademicSession);
router.delete("/:id", controller.deleteAcademicSession);

module.exports = router;
