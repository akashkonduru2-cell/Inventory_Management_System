const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET /api/transactions (All roles)
router.get('/', transactionController.getTransactions);

// GET /api/transactions/:id (All roles)
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
