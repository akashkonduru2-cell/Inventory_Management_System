const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

class ProductService {
  static async getAllProducts(filters) {
    return Product.findAll(filters);
  }

  static async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  static async createProduct({ sku, name, description, category_id, supplier_id, price, quantity = 0, minimum_stock = 5 }) {
    // Validate SKU uniqueness
    const existingSku = await Product.findBySku(sku);
    if (existingSku) {
      const error = new Error(`A product with SKU '${sku}' already exists`);
      error.statusCode = 409;
      throw error;
    }

    // Validate category exists
    const category = await Category.findById(category_id);
    if (!category) {
      const error = new Error('Selected category does not exist');
      error.statusCode = 400;
      throw error;
    }

    // Validate supplier exists
    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      const error = new Error('Selected supplier does not exist');
      error.statusCode = 400;
      throw error;
    }

    const id = await Product.create({
      sku: sku.toUpperCase().trim(),
      name,
      description,
      category_id: category_id.toString(),
      supplier_id: supplier_id.toString(),
      price: parseFloat(price),
      quantity: parseInt(quantity, 10) || 0,
      minimum_stock: parseInt(minimum_stock, 10) || 5
    });

    return Product.findById(id);
  }

  static async updateProduct(id, data) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.sku && data.sku.toUpperCase().trim() !== product.sku) {
      const existingSku = await Product.findBySku(data.sku.toUpperCase().trim());
      if (existingSku && existingSku.id !== id.toString()) {
        const error = new Error(`A product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.category_id) {
      const category = await Category.findById(data.category_id);
      if (!category) {
        const error = new Error('Selected category does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.supplier_id) {
      const supplier = await Supplier.findById(data.supplier_id);
      if (!supplier) {
        const error = new Error('Selected supplier does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    await Product.update(id, {
      sku: (data.sku || product.sku).toUpperCase().trim(),
      name: data.name || product.name,
      description: data.description !== undefined ? data.description : product.description,
      category_id: data.category_id ? data.category_id.toString() : product.category_id,
      supplier_id: data.supplier_id ? data.supplier_id.toString() : product.supplier_id,
      price: data.price !== undefined ? parseFloat(data.price) : product.price,
      quantity: data.quantity !== undefined ? parseInt(data.quantity, 10) : product.quantity,
      minimum_stock: data.minimum_stock !== undefined ? parseInt(data.minimum_stock, 10) : product.minimum_stock
    });

    return Product.findById(id);
  }

  static async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return Product.delete(id);
  }

  static async getLowStock() {
    return Product.getLowStock();
  }
}

module.exports = ProductService;
