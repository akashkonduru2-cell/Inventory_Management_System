import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from './Alert';
import api from '../services/api';

export const UserFormModal = ({ isOpen, onClose, user = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    is_active: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(user);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'EMPLOYEE',
          is_active: user.is_active !== undefined ? (user.is_active ? 1 : 0) : 1
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'EMPLOYEE',
          is_active: 1
        });
      }
      setError('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'is_active' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        const response = await api.put(`/users/${user.id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        });
        if (response.data.success) {
          onSuccess('User profile updated successfully');
          onClose();
        }
      } else {
        const response = await api.post('/users', formData);
        if (response.data.success) {
          onSuccess('User account created successfully');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit User: ${user.name}` : 'Provision New System User'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label className="form-label">
            Full Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rachel Adams"
            className="form-input"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Email Address <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rachel@company.com"
            className="form-input"
            required
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label className="form-label">
              Initial Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-input"
              required={!isEdit}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">System Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="EMPLOYEE">EMPLOYEE (Basic Operations)</option>
              <option value="MANAGER">MANAGER (Inventory Admin)</option>
              <option value="ADMIN">ADMIN (Full Control)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              className="form-select"
            >
              <option value={1}>Active</option>
              <option value={0}>Deactivated</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
