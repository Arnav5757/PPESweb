const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return structured field-level errors
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const sanitizeAndAlias = (req, res, next) => {
  if (req.body.name && !req.body.studentName) req.body.studentName = req.body.name;
  if (req.body.class && !req.body.desiredGrade) req.body.desiredGrade = req.body.class;
  if (req.body.phone && !req.body.contactNumber) req.body.contactNumber = req.body.phone;
  next();
};

const validateAdmission = [
  sanitizeAndAlias,
  body("studentName")
    .trim()
    .notEmpty()
    .withMessage("Student full name is required")
    .isLength({ min: 2 })
    .withMessage("Student name must be at least 2 characters"),
  body("desiredGrade")
    .trim()
    .notEmpty()
    .withMessage("Desired grade/class is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("parentName")
    .trim()
    .notEmpty()
    .withMessage("Parent/Guardian name is required"),
  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required")
    .isLength({ min: 10 })
    .withMessage("Contact number must be at least 10 digits"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Residential address is required"),
  body("age")
    .optional()
    .isInt({ min: 3, max: 25 })
    .withMessage("Age must be between 3 and 25"),
  body("previousSchool")
    .optional()
    .trim(),
  body("remarks")
    .optional()
    .trim(),

  handleValidationErrors
];

module.exports = {
  validateAdmission
};
