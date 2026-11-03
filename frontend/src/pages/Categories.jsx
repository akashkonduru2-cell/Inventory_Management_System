import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../components/Alert';
import api from '../services/api';
import { Plus, Tags, Edit2, Trash2, Package } from 'lucide-react';

export const Categories = () => {
  const { canManageCategories } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState({ isOpen: false, category: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;
    try {
      const res = await api.delete(`/categories/${deleteDialog.category.id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Category removed successfully' });
        setDeleteDialog({ isOpen: false, category: null });
        fetchCategories();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Cannot delete category with associated products.'
      });
      setDeleteDialog({ isOpen: false, category: null });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Product Categories</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Classify and organize equipment across warehouse segments
          </p>
        </div>
        {canManageCategories && (
          <button
            onClick={() => setFormModal({ isOpen: true, category: null })}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
          <Tags size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <p style={{ fontWeight: 600, fontSize: '15px' }}>No categories created yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tags size={18} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h3>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', minHeight: '38px', lineHeight: 1.5 }}>
                  {cat.description || 'No description added for this category.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} color="#64748b" /> {cat.product_count || 0} product{(cat.product_count || 0) === 1 ? '' : 's'} linked
                </span>

                {canManageCategories && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Edit Category"
                      onClick={() => setFormModal({ isOpen: true, category: cat })}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-outline btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Delete Category"
                      onClick={() => setDeleteDialog({ isOpen: true, category: cat })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {formModal.isOpen && (
        <CategoryFormModal
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, category: null })}
          category={formModal.category}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchCategories();
          }}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialog.isOpen && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, category: null })}
          onConfirm={handleDeleteConfirm}
          title={`Delete Category: ${deleteDialog.category?.name}`}
          message={`Are you sure you want to delete the category "${deleteDialog.category?.name}"? You cannot delete categories with active products attached.`}
        />
      )}
    </div>
  );
};
