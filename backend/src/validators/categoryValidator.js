const { body } = require('express-validator');

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
];

module.exports = {
  categoryValidator
};
