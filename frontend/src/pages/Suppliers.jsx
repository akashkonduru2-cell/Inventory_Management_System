import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../components/Alert';
import api from '../services/api';
import { Plus, Truck, Mail, Phone, MapPin, Edit2, Trash2, Package } from 'lucide-react';

export const Suppliers = () => {
  const { canManageSuppliers } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState({ isOpen: false, supplier: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, supplier: null });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.supplier) return;
    try {
      const res = await api.delete(`/suppliers/${deleteDialog.supplier.id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Supplier removed successfully' });
        setDeleteDialog({ isOpen: false, supplier: null });
        fetchSuppliers();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Cannot delete supplier with linked products.'
      });
      setDeleteDialog({ isOpen: false, supplier: null });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Supplier Directory</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Maintain vendor contact details, logistics partners, and associated catalog items
          </p>
        </div>
        {canManageSuppliers && (
          <button
            onClick={() => setFormModal({ isOpen: true, supplier: null })}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading suppliers...
        </div>
      ) : suppliers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
          <Truck size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <p style={{ fontWeight: 600, fontSize: '15px' }}>No suppliers registered yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {suppliers.map((sup) => (
            <div key={sup.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{sup.name}</h3>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Package size={12} /> {sup.product_count || 0} product{(sup.product_count || 0) === 1 ? '' : 's'} supplied
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{sup.email}</span>
                  </div>
                  {sup.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="#64748b" />
                      <span>{sup.phone}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <MapPin size={14} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {canManageSuppliers && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFormModal({ isOpen: true, supplier: sup })}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: '#ef4444' }}
                    onClick={() => setDeleteDialog({ isOpen: true, supplier: sup })}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {formModal.isOpen && (
        <SupplierFormModal
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, supplier: null })}
          supplier={formModal.supplier}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchSuppliers();
          }}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialog.isOpen && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, supplier: null })}
          onConfirm={handleDeleteConfirm}
          title={`Delete Supplier: ${deleteDialog.supplier?.name}`}
          message={`Are you sure you want to delete supplier "${deleteDialog.supplier?.name}"? You cannot delete suppliers with active products attached.`}
        />
      )}
    </div>
  );
};
