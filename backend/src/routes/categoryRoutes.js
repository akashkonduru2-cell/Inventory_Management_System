const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { categoryValidator } = require('../validators/categoryValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// GET /api/categories (All roles)
router.get('/', categoryController.getCategories);

// GET /api/categories/:id (All roles)
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories (ADMIN and MANAGER)
router.post(
  '/',
  authorizeRole('ADMIN', 'MANAGER'),
  categoryValidator,
  validate,
  categoryController.createCategory
);

// PUT /api/categories/:id (ADMIN and MANAGER)
router.put(
  '/:id',
  authorizeRole('ADMIN', 'MANAGER'),
  categoryValidator,
  validate,
  categoryController.updateCategory
);

// DELETE /api/categories/:id (ADMIN and MANAGER)
router.delete(
  '/:id',
  authorizeRole('ADMIN', 'MANAGER'),
  categoryController.deleteCategory
);

module.exports = router;
