const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { validateLogin, validateRegisterStudent } = require("../validators/authValidator");

router.post("/login", validateLogin, authController.login);
router.post("/register-student", verifyToken, verifyAdmin, validateRegisterStudent, authController.registerStudent);
router.get("/me", verifyToken, authController.getMe);

module.exports = router;
