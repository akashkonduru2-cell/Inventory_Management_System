const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 60,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 150,
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
      index: true
    },
    minimum_stock: {
      type: Number,
      default: 5,
      min: [0, 'Minimum stock cannot be negative']
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual for dynamic stock status
productSchema.virtual('stock_status').get(function () {
  const qty = this.quantity !== undefined ? this.quantity : 0;
  const minStock = this.minimum_stock !== undefined ? this.minimum_stock : 5;
  if (qty <= 0) return 'OUT_OF_STOCK';
  if (qty <= minStock) return 'LOW_STOCK';
  return 'IN_STOCK';
});

// Helper to format product document for API consistency
const formatProduct = (p) => {
  if (!p) return null;
  const categoryName = p.category_id && typeof p.category_id === 'object' ? p.category_id.name : undefined;
  const supplierName = p.supplier_id && typeof p.supplier_id === 'object' ? p.supplier_id.name : undefined;
  const categoryIdStr = p.category_id && typeof p.category_id === 'object' ? p.category_id._id.toString() : (p.category_id ? p.category_id.toString() : '');
  const supplierIdStr = p.supplier_id && typeof p.supplier_id === 'object' ? p.supplier_id._id.toString() : (p.supplier_id ? p.supplier_id.toString() : '');

  const qty = p.quantity !== undefined ? p.quantity : 0;
  const minStock = p.minimum_stock !== undefined ? p.minimum_stock : 5;
  let status = 'IN_STOCK';
  if (qty <= 0) status = 'OUT_OF_STOCK';
  else if (qty <= minStock) status = 'LOW_STOCK';

  return {
    id: p._id ? p._id.toString() : p.id,
    sku: p.sku,
    name: p.name,
    description: p.description || '',
    category_id: categoryIdStr,
    supplier_id: supplierIdStr,
    price: p.price,
    quantity: p.quantity,
    minimum_stock: p.minimum_stock,
    category_name: categoryName || p.category_name || 'Unassigned',
    supplier_name: supplierName || p.supplier_name || 'Unassigned',
    stock_status: status,
    created_at: p.created_at || p.createdAt,
    updated_at: p.updated_at || p.updatedAt
  };
};

productSchema.statics.findAll = async function ({ search = '', category_id = null, supplier_id = null, stock_status = null } = {}) {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { description: searchRegex }
    ];
  }

  if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
    query.category_id = category_id;
  }

  if (supplier_id && mongoose.Types.ObjectId.isValid(supplier_id)) {
    query.supplier_id = supplier_id;
  }

  if (stock_status === 'LOW_STOCK') {
    query.$expr = {
      $and: [
        { $gt: ['$quantity', 0] },
        { $lte: ['$quantity', '$minimum_stock'] }
      ]
    };
  } else if (stock_status === 'OUT_OF_STOCK') {
    query.quantity = { $lte: 0 };
  } else if (stock_status === 'IN_STOCK') {
    query.$expr = { $gt: ['$quantity', '$minimum_stock'] };
  }

  const products = await this.find(query)
    .populate('category_id', 'name')
    .populate('supplier_id', 'name')
    .sort({ created_at: -1 })
    .lean();

  return products.map(formatProduct);
};

productSchema.statics.findById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const product = await this.findOne({ _id: id })
    .populate('category_id', 'name')
    .populate('supplier_id', 'name')
    .lean();

  return formatProduct(product);
};

productSchema.statics.findBySku = async function (sku) {
  if (!sku) return null;
  const product = await this.findOne({ sku: sku.toUpperCase().trim() }).lean();
  return formatProduct(product);
};

productSchema.statics.create = async function ({ sku, name, description = '', category_id, supplier_id, price, quantity = 0, minimum_stock = 5 }) {
  const product = new this({
    sku: sku.toUpperCase().trim(),
    name: name.trim(),
    description: description.trim(),
    category_id,
    supplier_id,
    price: parseFloat(price),
    quantity: parseInt(quantity, 10) || 0,
    minimum_stock: parseInt(minimum_stock, 10) || 5
  });

  const saved = await product.save();
  return saved._id.toString();
};

productSchema.statics.update = async function (id, { sku, name, description, category_id, supplier_id, price, quantity, minimum_stock }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const updateData = {};
  if (sku !== undefined) updateData.sku = sku.toUpperCase().trim();
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (category_id !== undefined) updateData.category_id = category_id;
  if (supplier_id !== undefined) updateData.supplier_id = supplier_id;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (quantity !== undefined) updateData.quantity = parseInt(quantity, 10);
  if (minimum_stock !== undefined) updateData.minimum_stock = parseInt(minimum_stock, 10);

  const result = await this.updateOne({ _id: id }, { $set: updateData });
  return result.matchedCount > 0;
};

productSchema.statics.updateQuantity = async function (id, newQuantity) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.updateOne(
    { _id: id },
    { $set: { quantity: parseInt(newQuantity, 10) } }
  );
  return result.matchedCount > 0;
};

productSchema.statics.delete = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

productSchema.statics.getLowStock = async function () {
  const products = await this.find({
    $expr: { $lte: ['$quantity', '$minimum_stock'] }
  })
    .populate('category_id', 'name')
    .populate('supplier_id', 'name')
    .sort({ quantity: 1 })
    .lean();

  return products.map(formatProduct);
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
