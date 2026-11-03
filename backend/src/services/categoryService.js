const Category = require('../models/Category');

class CategoryService {
  static async getAllCategories() {
    return Category.findAll();
  }

  static async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  static async createCategory({ name, description }) {
    const existing = await Category.findByName(name);
    if (existing) {
      const error = new Error('Category name already exists');
      error.statusCode = 409;
      throw error;
    }

    const id = await Category.create({ name, description });
    return Category.findById(id);
  }

  static async updateCategory(id, { name, description }) {
    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (name && name !== category.name) {
      const existing = await Category.findByName(name);
      if (existing && existing.id !== id.toString()) {
        const error = new Error('Category name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    await Category.update(id, {
      name: name || category.name,
      description: description !== undefined ? description : category.description
    });

    return Category.findById(id);
  }

  static async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const productCount = await Category.countProducts(id);
    if (productCount > 0) {
      const error = new Error(`Cannot delete category: ${productCount} products are currently linked to it.`);
      error.statusCode = 400;
      throw error;
    }

    return Category.delete(id);
  }
}

module.exports = CategoryService;
