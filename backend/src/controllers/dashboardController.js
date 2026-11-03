const DashboardService = require('../services/dashboardService');

const getStats = async (req, res, next) => {
  try {
    const stats = await DashboardService.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const transactions = await DashboardService.getRecentTransactions(limit);
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const lowStock = await DashboardService.getLowStock();
    res.status(200).json({
      success: true,
      data: lowStock
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const [stats, categoryDistribution, stockMovements, topMovedProducts, lowStock] = await Promise.all([
      DashboardService.getStats(),
      DashboardService.getCategoryDistribution(),
      DashboardService.getStockMovements(),
      DashboardService.getTopMovedProducts(5),
      DashboardService.getLowStock()
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        categoryDistribution,
        stockMovements,
        topMovedProducts,
        lowStock
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRecentTransactions,
  getLowStock,
  getReports
};
