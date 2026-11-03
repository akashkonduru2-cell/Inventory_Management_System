const { body } = require('express-validator');

const stockActionValidator = [
  body('product_id')
    .notEmpty().withMessage('Product ID is required')
    .isString().withMessage('Valid Product ID is required'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer greater than 0'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Reason cannot exceed 255 characters')
];

module.exports = {
  stockActionValidator
};
