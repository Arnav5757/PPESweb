const express = require("express");
const router = express.Router();
const controller = require("../controllers/sectionController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", controller.getSections);
router.get("/:id", controller.getSectionById);
router.post("/", controller.createSection);
router.put("/:id", controller.updateSection);
router.delete("/:id", controller.deleteSection);

module.exports = router;
