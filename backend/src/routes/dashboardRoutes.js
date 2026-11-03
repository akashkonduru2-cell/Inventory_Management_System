const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/recent-transactions
router.get('/recent-transactions', dashboardController.getRecentTransactions);

// GET /api/dashboard/low-stock
router.get('/low-stock', dashboardController.getLowStock);

// GET /api/dashboard/reports
router.get('/reports', dashboardController.getReports);

module.exports = router;
