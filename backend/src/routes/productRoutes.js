const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { productValidator } = require('../validators/productValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// GET /api/products (All roles: ADMIN, MANAGER, EMPLOYEE)
router.get('/', productController.getProducts);

// GET /api/products/:id (All roles)
router.get('/:id', productController.getProductById);

// POST /api/products (ADMIN and MANAGER only)
router.post(
  '/',
  authorizeRole('ADMIN', 'MANAGER'),
  productValidator,
  validate,
  productController.createProduct
);

// PUT /api/products/:id (ADMIN and MANAGER only)
router.put(
  '/:id',
  authorizeRole('ADMIN', 'MANAGER'),
  productValidator,
  validate,
  productController.updateProduct
);

// DELETE /api/products/:id (ADMIN only)
router.delete(
  '/:id',
  authorizeRole('ADMIN'),
  productController.deleteProduct
);

module.exports = router;
