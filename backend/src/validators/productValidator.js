const { body } = require('express-validator');

const productValidator = [
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ max: 60 }).withMessage('SKU cannot exceed 60 characters'),
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 150 }).withMessage('Product name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim(),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Valid Category ID is required'),
  body('supplier_id')
    .notEmpty().withMessage('Supplier is required')
    .isString().withMessage('Valid Supplier ID is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative'),
  body('minimum_stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock cannot be negative')
];

module.exports = {
  productValidator
};
