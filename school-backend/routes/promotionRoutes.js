const express = require("express");
const router = express.Router();
const controller = require("../controllers/promotionController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getPromotions);
router.get("/student/:studentId", controller.getStudentPromotionHistory);
router.post("/", controller.promoteStudent);

module.exports = router;
