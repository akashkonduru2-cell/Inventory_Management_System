const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['IN', 'OUT'],
        message: 'Transaction type must be IN or OUT'
      },
      required: [true, 'Type is required'],
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    previous_quantity: {
      type: Number,
      required: true
    },
    new_quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: '',
      trim: true
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

transactionSchema.index({ created_at: -1 });

// Helper to format transaction document for API response
const formatTransaction = (t) => {
  if (!t) return null;
  const productName = t.product_id && typeof t.product_id === 'object' ? t.product_id.name : undefined;
  const productSku = t.product_id && typeof t.product_id === 'object' ? t.product_id.sku : undefined;
  const productIdStr = t.product_id && typeof t.product_id === 'object' ? t.product_id._id.toString() : (t.product_id ? t.product_id.toString() : '');

  const userName = t.user_id && typeof t.user_id === 'object' ? t.user_id.name : undefined;
  const userEmail = t.user_id && typeof t.user_id === 'object' ? t.user_id.email : undefined;
  const userIdStr = t.user_id && typeof t.user_id === 'object' ? t.user_id._id.toString() : (t.user_id ? t.user_id.toString() : '');

  return {
    id: t._id ? t._id.toString() : t.id,
    product_id: productIdStr,
    user_id: userIdStr,
    type: t.type,
    quantity: t.quantity,
    previous_quantity: t.previous_quantity,
    new_quantity: t.new_quantity,
    reason: t.reason || '',
    product_name: productName || t.product_name || 'Unknown Product',
    product_sku: productSku || t.product_sku || '',
    user_name: userName || t.user_name || 'System User',
    user_email: userEmail || t.user_email || '',
    created_at: t.created_at || t.createdAt,
    updated_at: t.updated_at || t.updatedAt
  };
};

transactionSchema.statics.findAll = async function ({ type = null, product_id = null, user_id = null, start_date = null, end_date = null } = {}) {
  const query = {};

  if (type) {
    query.type = type.toUpperCase();
  }

  if (product_id && mongoose.Types.ObjectId.isValid(product_id)) {
    query.product_id = product_id;
  }

  if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
    query.user_id = user_id;
  }

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) {
      query.created_at.$gte = new Date(start_date);
    }
    if (end_date) {
      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);
      query.created_at.$lte = end;
    }
  }

  const transactions = await this.find(query)
    .populate('product_id', 'name sku')
    .populate('user_id', 'name email')
    .sort({ created_at: -1 })
    .lean();

  return transactions.map(formatTransaction);
};

transactionSchema.statics.findById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const transaction = await this.findOne({ _id: id })
    .populate('product_id', 'name sku')
    .populate('user_id', 'name email')
    .lean();

  return formatTransaction(transaction);
};

transactionSchema.statics.create = async function ({ product_id, user_id, type, quantity, previous_quantity, new_quantity, reason = '' }) {
  const transaction = new this({
    product_id,
    user_id,
    type,
    quantity: parseInt(quantity, 10),
    previous_quantity: parseInt(previous_quantity, 10),
    new_quantity: parseInt(new_quantity, 10),
    reason: reason.trim()
  });

  const saved = await transaction.save();
  return saved._id.toString();
};

transactionSchema.statics.getRecent = async function (limit = 10) {
  const transactions = await this.find()
    .populate('product_id', 'name sku')
    .populate('user_id', 'name')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return transactions.map(formatTransaction);
};

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
