const Supplier = require('../models/Supplier');

class SupplierService {
  static async getAllSuppliers() {
    return Supplier.findAll();
  }

  static async getSupplierById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found');
      error.statusCode = 404;
      throw error;
    }
    return supplier;
  }

  static async createSupplier({ name, email, phone, address }) {
    const id = await Supplier.create({ name, email, phone, address });
    return Supplier.findById(id);
  }

  static async updateSupplier(id, { name, email, phone, address }) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found');
      error.statusCode = 404;
      throw error;
    }

    await Supplier.update(id, {
      name: name || supplier.name,
      email: email || supplier.email,
      phone: phone !== undefined ? phone : supplier.phone,
      address: address !== undefined ? address : supplier.address
    });

    return Supplier.findById(id);
  }

  static async deleteSupplier(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found');
      error.statusCode = 404;
      throw error;
    }

    const productCount = await Supplier.countProducts(id);
    if (productCount > 0) {
      const error = new Error(`Cannot delete supplier: ${productCount} products are currently linked to this supplier.`);
      error.statusCode = 400;
      throw error;
    }

    return Supplier.delete(id);
  }
}

module.exports = SupplierService;
