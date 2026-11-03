const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { supplierValidator } = require('../validators/supplierValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// GET /api/suppliers (All roles)
router.get('/', supplierController.getSuppliers);

// GET /api/suppliers/:id (All roles)
router.get('/:id', supplierController.getSupplierById);

// POST /api/suppliers (ADMIN and MANAGER)
router.post(
  '/',
  authorizeRole('ADMIN', 'MANAGER'),
  supplierValidator,
  validate,
  supplierController.createSupplier
);

// PUT /api/suppliers/:id (ADMIN and MANAGER)
router.put(
  '/:id',
  authorizeRole('ADMIN', 'MANAGER'),
  supplierValidator,
  validate,
  supplierController.updateSupplier
);

// DELETE /api/suppliers/:id (ADMIN and MANAGER)
router.delete(
  '/:id',
  authorizeRole('ADMIN', 'MANAGER'),
  supplierController.deleteSupplier
);

module.exports = router;
