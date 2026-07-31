const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map(err => err.msg).join(". ")
    });
  }
  next();
};

const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email or username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors
];

const validateRegisterStudent = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("studentProfileId")
    .notEmpty()
    .withMessage("Linked student profile ID is required"),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegisterStudent
};
