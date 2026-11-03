const UserService = require('../services/userService');

const getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        is_active: u.is_active,
        created_at: u.created_at,
        updated_at: u.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, is_active } = req.body;
    const newUser = await UserService.createUser({ name, email, password, role, is_active });
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, is_active } = req.body;
    const updatedUser = await UserService.updateUser(req.params.id, { name, email, role, is_active });
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_active field is required'
      });
    }

    const updatedUser = await UserService.toggleUserStatus(req.params.id, is_active);
    res.status(200).json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_active: updatedUser.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting own account
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    await UserService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};
