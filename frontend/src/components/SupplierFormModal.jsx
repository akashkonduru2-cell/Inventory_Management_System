import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from './Alert';
import api from '../services/api';

export const SupplierFormModal = ({ isOpen, onClose, supplier = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(supplier);

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      }
      setError('');
    }
  }, [isOpen, supplier]);

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
        const response = await api.put(`/suppliers/${supplier.id}`, formData);
        if (response.data.success) {
          onSuccess('Supplier updated successfully');
          onClose();
        }
      } else {
        const response = await api.post('/suppliers', formData);
        if (response.data.success) {
          onSuccess('Supplier added successfully');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Supplier: ${supplier.name}` : 'Add New Supplier'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Supplier' : 'Create Supplier'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label className="form-label">
            Supplier Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Apex Electronics Dist."
            className="form-input"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Contact Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="orders@supplier.com"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1-555-0199"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Warehouse / Office Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street, City, State, ZIP..."
            className="form-textarea"
          />
        </div>
      </form>
    </Modal>
  );
};
