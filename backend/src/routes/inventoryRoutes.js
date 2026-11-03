const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { stockActionValidator } = require('../validators/inventoryValidator');
const { validate } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// GET /api/inventory (All roles)
router.get('/', inventoryController.getInventory);

// GET /api/inventory/low-stock (All roles)
router.get('/low-stock', inventoryController.getLowStock);

// POST /api/inventory/stock-in (ADMIN and MANAGER only)
router.post(
  '/stock-in',
  authorizeRole('ADMIN', 'MANAGER'),
  stockActionValidator,
  validate,
  inventoryController.stockIn
);

// POST /api/inventory/stock-out (ADMIN, MANAGER, and EMPLOYEE)
router.post(
  '/stock-out',
  authorizeRole('ADMIN', 'MANAGER', 'EMPLOYEE'),
  stockActionValidator,
  validate,
  inventoryController.stockOut
);

module.exports = router;
