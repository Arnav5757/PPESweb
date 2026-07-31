const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { validateGallery } = require("../validators/galleryValidator");

router.get("/", galleryController.getGallery);
router.post("/", verifyToken, verifyAdmin, validateGallery, galleryController.createGalleryItem);
router.put("/:id", verifyToken, verifyAdmin, galleryController.updateGalleryItem);
router.delete("/:id", verifyToken, verifyAdmin, galleryController.deleteGalleryItem);

module.exports = router;

