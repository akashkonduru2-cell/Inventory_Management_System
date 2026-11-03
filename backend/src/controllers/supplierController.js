const SupplierService = require('../services/supplierService');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await SupplierService.getAllSuppliers();
    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await SupplierService.getSupplierById(req.params.id);
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const newSupplier = await SupplierService.createSupplier(req.body);
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier
    });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const updatedSupplier = await SupplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    await SupplierService.deleteSupplier(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
