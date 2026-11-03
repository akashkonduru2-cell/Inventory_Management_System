const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');

class DashboardService {
  static async getStats() {
    const products = await Product.findAll();
    const categories = await Category.findAll();
    const suppliers = await Supplier.findAll();
    const transactions = await Transaction.findAll();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
    const totalStockValue = products.reduce((sum, p) => sum + ((parseFloat(p.price) || 0) * (parseInt(p.quantity, 10) || 0)), 0);
    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minimum_stock).length;
    const outOfStockCount = products.filter(p => p.quantity <= 0).length;
    const totalTransactions = transactions.length;

    // IN vs OUT quantities
    const totalInUnits = transactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + (parseInt(t.quantity, 10) || 0), 0);
    const totalOutUnits = transactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + (parseInt(t.quantity, 10) || 0), 0);

    return {
      totalProducts,
      totalStock,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      lowStockCount,
      outOfStockCount,
      totalTransactions,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
      totalInUnits,
      totalOutUnits
    };
  }

  static async getRecentTransactions(limit = 10) {
    const transactions = await Transaction.findAll();
    return transactions.slice(0, limit);
  }

  static async getLowStock() {
    return Product.getLowStock();
  }

  static async getCategoryDistribution() {
    const categories = await Category.findAll();
    const products = await Product.findAll();

    return categories.map(cat => {
      const catProducts = products.filter(p => p.category_id?.toString() === cat.id?.toString());
      const totalStock = catProducts.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
      const totalValue = catProducts.reduce((sum, p) => sum + ((parseFloat(p.price) || 0) * (parseInt(p.quantity, 10) || 0)), 0);

      return {
        category_id: cat.id,
        category_name: cat.name,
        product_count: catProducts.length,
        total_stock: totalStock,
        total_value: Math.round(totalValue * 100) / 100
      };
    });
  }

  static async getStockMovements() {
    const transactions = await Transaction.findAll();
    
    // Group transactions by date
    const movementsByDate = {};

    transactions.forEach(t => {
      const dateStr = (t.created_at || '').toString().substring(0, 10) || 'Recent';
      if (!movementsByDate[dateStr]) {
        movementsByDate[dateStr] = { date: dateStr, stockIn: 0, stockOut: 0 };
      }
      if (t.type === 'IN') {
        movementsByDate[dateStr].stockIn += parseInt(t.quantity, 10) || 0;
      } else if (t.type === 'OUT') {
        movementsByDate[dateStr].stockOut += parseInt(t.quantity, 10) || 0;
      }
    });

    return Object.values(movementsByDate).sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getTopMovedProducts(limit = 5) {
    const transactions = await Transaction.findAll();

    const productMovements = {};

    transactions.forEach(t => {
      const prodKey = t.product_id ? t.product_id.toString() : 'unknown';
      if (!productMovements[prodKey]) {
        productMovements[prodKey] = {
          product_id: prodKey,
          product_name: t.product_name || 'Product #' + prodKey,
          product_sku: t.product_sku || '',
          total_transactions: 0,
          total_units_moved: 0,
          in_units: 0,
          out_units: 0
        };
      }
      productMovements[prodKey].total_transactions += 1;
      productMovements[prodKey].total_units_moved += parseInt(t.quantity, 10) || 0;
      if (t.type === 'IN') {
        productMovements[prodKey].in_units += parseInt(t.quantity, 10) || 0;
      } else {
        productMovements[prodKey].out_units += parseInt(t.quantity, 10) || 0;
      }
    });

    return Object.values(productMovements)
      .sort((a, b) => b.total_units_moved - a.total_units_moved)
      .slice(0, limit);
  }
}

module.exports = DashboardService;
