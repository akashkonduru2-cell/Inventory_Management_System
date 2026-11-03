const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    description: {
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

categorySchema.statics.findAll = async function () {
  const Product = mongoose.model('Product');
  const categories = await this.find().sort({ name: 1 }).lean({ virtuals: true });
  
  // Aggregate product counts for each category
  const results = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({ category_id: cat._id });
      return {
        ...cat,
        id: cat._id.toString(),
        product_count: productCount
      };
    })
  );

  return results;
};

categorySchema.statics.findById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const category = await this.findOne({ _id: id }).lean({ virtuals: true });
  if (category) category.id = category._id.toString();
  return category;
};

categorySchema.statics.findByName = async function (name) {
  if (!name) return null;
  const category = await this.findOne({ name: name.trim() }).lean({ virtuals: true });
  if (category) category.id = category._id.toString();
  return category;
};

categorySchema.statics.create = async function ({ name, description = '' }) {
  const cat = new this({
    name: name.trim(),
    description: description.trim()
  });
  const saved = await cat.save();
  return saved._id.toString();
};

categorySchema.statics.update = async function (id, { name, description }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();

  const result = await this.updateOne({ _id: id }, { $set: updateData });
  return result.matchedCount > 0;
};

categorySchema.statics.countProducts = async function (categoryId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) return 0;
  const Product = mongoose.model('Product');
  return Product.countDocuments({ category_id: categoryId });
};

categorySchema.statics.delete = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = Category;
