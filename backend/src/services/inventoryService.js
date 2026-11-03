const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

class InventoryService {
  /**
   * Perform Stock IN operation with atomic MongoDB updates
   * Increments product quantity and creates an IN transaction log.
   */
  static async stockIn({ product_id, quantity, reason = '', user_id }) {
    const qty = parseInt(quantity, 10);
    const prodId = product_id ? product_id.toString() : '';
    const userId = user_id ? user_id.toString() : '';

    if (isNaN(qty) || qty <= 0) {
      const error = new Error('Stock IN quantity must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    // Fetch product to verify existence
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error(`Product with ID ${prodId} not found`);
      error.statusCode = 404;
      throw error;
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + qty;

    // 1. Update product quantity
    await Product.updateQuantity(prodId, newQuantity);

    // 2. Record inventory transaction
    const transactionId = await Transaction.create({
      product_id: prodId,
      user_id: userId,
      type: 'IN',
      quantity: qty,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reason: reason || 'Stock IN replenishment'
    });

    const updatedProduct = await Product.findById(prodId);
    const transaction = await Transaction.findById(transactionId);

    return {
      product: updatedProduct,
      transaction
    };
  }

  /**
   * Perform Stock OUT operation with atomic stock integrity protection
   * Decrements product stock and strictly prevents negative inventory.
   */
  static async stockOut({ product_id, quantity, reason = '', user_id }) {
    const qty = parseInt(quantity, 10);
    const prodId = product_id ? product_id.toString() : '';
    const userId = user_id ? user_id.toString() : '';

    if (isNaN(qty) || qty <= 0) {
      const error = new Error('Stock OUT quantity must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    // Fetch current product state
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error(`Product with ID ${prodId} not found`);
      error.statusCode = 404;
      throw error;
    }

    const previousQuantity = product.quantity;

    // Business Rule: Ensure sufficient inventory is available
    if (previousQuantity < qty) {
      const error = new Error(
        `Insufficient stock. Available stock is ${previousQuantity} unit(s), but requested OUT is ${qty} unit(s).`
      );
      error.statusCode = 400;
      throw error;
    }

    const newQuantity = previousQuantity - qty;

    // 1. Update product quantity
    await Product.updateQuantity(prodId, newQuantity);

    // 2. Record inventory transaction
    const transactionId = await Transaction.create({
      product_id: prodId,
      user_id: userId,
      type: 'OUT',
      quantity: qty,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reason: reason || 'Stock OUT dispatch'
    });

    const updatedProduct = await Product.findById(prodId);
    const transaction = await Transaction.findById(transactionId);

    return {
      product: updatedProduct,
      transaction
    };
  }

  /**
   * Fetch current inventory stock summary
   */
  static async getInventoryOverview(filters = {}) {
    return Product.findAll(filters);
  }

  /**
   * Fetch stock status counts
   */
  static async getInventoryMetrics() {
    const products = await Product.findAll();

    const totalSKUs = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);

    const inStock = products.filter((p) => p.stock_status === 'IN_STOCK').length;
    const lowStock = products.filter((p) => p.stock_status === 'LOW_STOCK').length;
    const outOfStock = products.filter((p) => p.stock_status === 'OUT_OF_STOCK').length;

    return {
      totalSKUs,
      totalUnits,
      totalValue: Math.round(totalValue * 100) / 100,
      inStock,
      lowStock,
      outOfStock
    };
  }
}

module.exports = InventoryService;
