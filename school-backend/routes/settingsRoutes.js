const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

module.exports = router;
