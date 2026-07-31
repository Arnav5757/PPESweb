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

const validateGallery = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Gallery photo title is required"),
  body("imageUrl")
    .notEmpty()
    .withMessage("Image source payload is required"),
  body("category")
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  validateGallery
};
