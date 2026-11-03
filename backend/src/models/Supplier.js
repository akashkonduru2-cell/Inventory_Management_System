const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: 150,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    address: {
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

supplierSchema.statics.findAll = async function () {
  const Product = mongoose.model('Product');
  const suppliers = await this.find().sort({ name: 1 }).lean({ virtuals: true });

  // Aggregate product counts for each supplier
  const results = await Promise.all(
    suppliers.map(async (sup) => {
      const productCount = await Product.countDocuments({ supplier_id: sup._id });
      return {
        ...sup,
        id: sup._id.toString(),
        product_count: productCount
      };
    })
  );

  return results;
};

supplierSchema.statics.findById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const supplier = await this.findOne({ _id: id }).lean({ virtuals: true });
  if (supplier) supplier.id = supplier._id.toString();
  return supplier;
};

supplierSchema.statics.create = async function ({ name, email, phone = '', address = '' }) {
  const sup = new this({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    address: address.trim()
  });
  const saved = await sup.save();
  return saved._id.toString();
};

supplierSchema.statics.update = async function (id, { name, email, phone, address }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.toLowerCase().trim();
  if (phone !== undefined) updateData.phone = phone.trim();
  if (address !== undefined) updateData.address = address.trim();

  const result = await this.updateOne({ _id: id }, { $set: updateData });
  return result.matchedCount > 0;
};

supplierSchema.statics.countProducts = async function (supplierId) {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) return 0;
  const Product = mongoose.model('Product');
  return Product.countDocuments({ supplier_id: supplierId });
};

supplierSchema.statics.delete = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
