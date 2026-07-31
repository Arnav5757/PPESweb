const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/", feeController.getFees);
router.post("/", feeController.createFee);
router.post("/:id/pay", feeController.payFee);

module.exports = router;
