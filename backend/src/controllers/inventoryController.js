const InventoryService = require('../services/inventoryService');
const ProductService = require('../services/productService');

const getInventory = async (req, res, next) => {
  try {
    const { search, category_id, supplier_id, stock_status } = req.query;
    const products = await ProductService.getAllProducts({
      search,
      category_id: category_id ? parseInt(category_id, 10) : null,
      supplier_id: supplier_id ? parseInt(supplier_id, 10) : null,
      stock_status
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const { product_id, quantity, reason } = req.body;
    const result = await InventoryService.stockIn({
      product_id,
      quantity,
      reason,
      user_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Stock IN recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const { product_id, quantity, reason } = req.body;
    const result = await InventoryService.stockOut({
      product_id,
      quantity,
      reason,
      user_id: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Stock OUT recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const lowStockProducts = await InventoryService.getLowStock();
    res.status(200).json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  stockIn,
  stockOut,
  getLowStock
};
