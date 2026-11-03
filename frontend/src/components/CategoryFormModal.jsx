import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from './Alert';
import api from '../services/api';

export const CategoryFormModal = ({ isOpen, onClose, category = null, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(category);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setDescription(category.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        const response = await api.put(`/categories/${category.id}`, { name, description });
        if (response.data.success) {
          onSuccess('Category updated successfully');
          onClose();
        }
      } else {
        const response = await api.post('/categories', { name, description });
        if (response.data.success) {
          onSuccess('Category created successfully');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Category: ${category.name}` : 'Add New Category'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label className="form-label">
            Category Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Storage Devices"
            className="form-input"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category scope and types of equipment..."
            className="form-textarea"
          />
        </div>
      </form>
    </Modal>
  );
};
