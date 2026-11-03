const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

// All user management routes are restricted to ADMIN only
router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

// GET /api/users
router.get('/', userController.getUsers);

// POST /api/users
router.post('/', createUserValidator, validate, userController.createUser);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// PUT /api/users/:id
router.put('/:id', updateUserValidator, validate, userController.updateUser);

// PATCH /api/users/:id/status
router.patch('/:id/status', userController.toggleUserStatus);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;
