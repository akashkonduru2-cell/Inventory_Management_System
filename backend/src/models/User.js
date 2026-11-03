const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
        message: 'Role must be ADMIN, MANAGER, or EMPLOYEE'
      },
      default: 'EMPLOYEE',
      index: true
    },
    is_active: {
      type: Boolean,
      default: true
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

// Static helper methods for clean service access
userSchema.statics.findById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const user = await this.findOne({ _id: id }).select('-password').lean({ virtuals: true });
  if (user) user.id = user._id.toString();
  return user;
};

userSchema.statics.findByEmail = async function (email) {
  if (!email) return null;
  const user = await this.findOne({ email: email.toLowerCase().trim() }).lean({ virtuals: true });
  if (user) user.id = user._id.toString();
  return user;
};

userSchema.statics.findAll = async function () {
  const users = await this.find().select('-password').sort({ created_at: -1 }).lean({ virtuals: true });
  return users.map(u => {
    u.id = u._id.toString();
    return u;
  });
};

userSchema.statics.create = async function ({ name, email, password, role = 'EMPLOYEE', is_active = true }) {
  const user = new this({
    name,
    email: email.toLowerCase().trim(),
    password,
    role,
    is_active: is_active === true || is_active === 1 || is_active === '1'
  });
  const saved = await user.save();
  return saved._id.toString();
};

userSchema.statics.update = async function (id, { name, email, role, is_active }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase().trim();
  if (role !== undefined) updateData.role = role;
  if (is_active !== undefined) updateData.is_active = is_active === true || is_active === 1 || is_active === '1';

  const result = await this.updateOne({ _id: id }, { $set: updateData });
  return result.matchedCount > 0;
};

userSchema.statics.updateStatus = async function (id, is_active) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.updateOne(
    { _id: id },
    { $set: { is_active: is_active === true || is_active === 1 || is_active === '1' } }
  );
  return result.matchedCount > 0;
};

userSchema.statics.delete = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await this.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
