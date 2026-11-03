const { body } = require('express-validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('User name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean')
];

const updateUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('User name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean')
];

module.exports = {
  createUserValidator,
  updateUserValidator
};
