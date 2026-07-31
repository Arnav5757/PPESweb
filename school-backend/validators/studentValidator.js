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

const validateStudent = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
  body("rollNumber")
    .trim()
    .notEmpty()
    .withMessage("Roll number is required"),
  body("class")
    .trim()
    .notEmpty()
    .withMessage("Class level is required"),
  body("section")
    .trim()
    .notEmpty()
    .withMessage("Section is required"),
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required"),
  body("dob")
    .notEmpty()
    .withMessage("Date of birth is required"),
  body("bloodGroup")
    .trim()
    .notEmpty()
    .withMessage("Blood group is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required"),
  body("motherName")
    .trim()
    .notEmpty()
    .withMessage("Mother name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  
  // Login info checks
  body("loginUsername")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("loginEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid login email is required"),
  body("loginPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Login password must be at least 6 characters long"),
    
  handleValidationErrors
];

const validateUpdateStudent = [
  body("firstName").optional().trim().notEmpty(),
  body("lastName").optional().trim().notEmpty(),
  body("rollNumber").optional().trim().notEmpty(),
  body("class").optional().trim().notEmpty(),
  body("section").optional().trim().notEmpty(),
  body("gender").optional().trim().notEmpty(),
  body("dob").optional().notEmpty(),
  body("bloodGroup").optional().trim().notEmpty(),
  body("category").optional().trim().notEmpty(),
  body("fatherName").optional().trim().notEmpty(),
  body("motherName").optional().trim().notEmpty(),
  body("phone").optional().trim().notEmpty(),
  body("address").optional().trim().notEmpty(),
  body("loginUsername").optional().trim().isLength({ min: 3 }),
  body("loginEmail").optional().trim().isEmail(),
  body("loginPassword").optional().isLength({ min: 6 }),
  handleValidationErrors
];

module.exports = {
  validateStudent,
  validateUpdateStudent
};
