const express = require("express");
const router = express.Router();
const admissionController = require("../controllers/admissionController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { validateAdmission } = require("../validators/admissionValidator");

// PUBLIC route — no auth required (applicants submit from the website)
router.post("/", validateAdmission, admissionController.createAdmission);

// ADMIN routes — require authentication
router.get("/", verifyToken, verifyAdmin, admissionController.getAdmissions);
router.get("/:id", verifyToken, verifyAdmin, admissionController.getAdmissionById);
router.put("/:id", verifyToken, verifyAdmin, admissionController.updateAdmission);
router.post("/:id/approve", verifyToken, verifyAdmin, admissionController.approveAdmission);
router.put("/:id/reject", verifyToken, verifyAdmin, admissionController.rejectAdmission);
router.delete("/:id", verifyToken, verifyAdmin, admissionController.deleteAdmission);

module.exports = router;
