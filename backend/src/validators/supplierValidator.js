const { body } = require('express-validator');

const supplierValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Supplier name is required')
    .isLength({ max: 150 }).withMessage('Supplier name cannot exceed 150 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone number cannot exceed 50 characters'),
  body('address')
    .optional()
    .trim()
];

module.exports = {
  supplierValidator
};
