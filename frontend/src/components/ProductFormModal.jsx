import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from './Alert';
import api from '../services/api';

export const ProductFormModal = ({ isOpen, onClose, product = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    price: '',
    quantity: 0,
    minimum_stock: 5
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(product);

  useEffect(() => {
    if (isOpen) {
      // Fetch dropdown options
      Promise.all([api.get('/categories'), api.get('/suppliers')])
        .then(([catRes, supRes]) => {
          setCategories(catRes.data.data || []);
          setSuppliers(supRes.data.data || []);
        })
        .catch((err) => console.error('Failed to load categories/suppliers:', err));

      if (product) {
        setFormData({
          sku: product.sku || '',
          name: product.name || '',
          description: product.description || '',
          category_id: product.category_id || '',
          supplier_id: product.supplier_id || '',
          price: product.price || '',
          quantity: product.quantity !== undefined ? product.quantity : 0,
          minimum_stock: product.minimum_stock !== undefined ? product.minimum_stock : 5
        });
      } else {
        setFormData({
          sku: '',
          name: '',
          description: '',
          category_id: '',
          supplier_id: '',
          price: '',
          quantity: 0,
          minimum_stock: 5
        });
      }
      setError('');
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        const response = await api.put(`/products/${product.id}`, formData);
        if (response.data.success) {
          onSuccess('Product updated successfully');
          onClose();
        }
      } else {
        const response = await api.post('/products', formData);
        if (response.data.success) {
          onSuccess('Product created successfully');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Product: ${product.sku}` : 'Add New Product'}
      size="large"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              SKU (Stock Keeping Unit) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. COMP-LAP-001"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Product Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dell Latitude 15 Pro"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed specifications or product notes..."
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Supplier <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              Unit Price (₹) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Quantity</label>
            <input
              type="number"
              min="0"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              disabled={isEdit} // Stock modifications in edit should be done via Stock IN/OUT transactions
            />
            {isEdit && <span style={{ fontSize: '11px', color: '#64748b' }}>Use Stock IN/OUT to alter live stock</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Stock Alert Threshold</label>
            <input
              type="number"
              min="0"
              name="minimum_stock"
              value={formData.minimum_stock}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
