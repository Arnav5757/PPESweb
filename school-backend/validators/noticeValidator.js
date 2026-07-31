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

const validateNotice = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Notice title is required"),
  body("date")
    .notEmpty()
    .withMessage("Date is required"),
  body("category")
    .optional()
    .trim(),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Notice content is required"),
  handleValidationErrors
];

module.exports = {
  validateNotice
};
