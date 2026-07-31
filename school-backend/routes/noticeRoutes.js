const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { validateNotice } = require("../validators/noticeValidator");

router.get("/", noticeController.getNotices);
router.post("/", verifyToken, verifyAdmin, validateNotice, noticeController.createNotice);
router.put("/:id", verifyToken, verifyAdmin, noticeController.updateNotice);
router.delete("/:id", verifyToken, verifyAdmin, noticeController.deleteNotice);

module.exports = router;

