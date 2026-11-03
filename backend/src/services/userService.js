const bcrypt = require('bcryptjs');
const User = require('../models/User');

class UserService {
  static async getAllUsers() {
    return User.findAll();
  }

  static async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async createUser({ name, email, password, role = 'EMPLOYEE', is_active = true }) {
    const existing = await User.findByEmail(email);
    if (existing) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      is_active: is_active === true || is_active === 1 || is_active === '1'
    });

    return User.findById(userId);
  }

  static async updateUser(id, { name, email, role, is_active }) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== id.toString()) {
        const error = new Error('Another user already uses this email address');
        error.statusCode = 409;
        throw error;
      }
    }

    await User.update(id, {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    return User.findById(id);
  }

  static async toggleUserStatus(id, is_active) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await User.updateStatus(id, is_active);
    return User.findById(id);
  }

  static async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return User.delete(id);
  }
}

module.exports = UserService;
