import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const StockActionModal = ({ isOpen, onClose, product, type = 'IN', onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isStockIn = type === 'IN';
  const currentStock = product ? parseInt(product.quantity, 10) : 0;
  const qtyNum = parseInt(quantity, 10) || 0;

  const newStock = isStockIn ? currentStock + qtyNum : currentStock - qtyNum;
  const isInsufficient = !isStockIn && qtyNum > currentStock;

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setReason(isStockIn ? 'Shipment intake replenishment' : 'Customer order dispatch');
      setError('');
    }
  }, [isOpen, isStockIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qtyNum <= 0) {
      setError('Please enter a quantity greater than 0.');
      return;
    }

    if (isInsufficient) {
      setError(`Cannot dispatch ${qtyNum} units. Only ${currentStock} units are available.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isStockIn ? '/inventory/stock-in' : '/inventory/stock-out';
      const response = await api.post(endpoint, {
        product_id: product.id,
        quantity: qtyNum,
        reason: reason.trim()
      });

      if (response.data.success) {
        onSuccess(response.data.message || 'Operation successful');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isStockIn ? `Stock IN (Restock Product)` : `Stock OUT (Dispatch Product)`}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isStockIn ? 'btn-success' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={loading || isInsufficient || qtyNum <= 0}
          >
            {loading ? 'Processing...' : isStockIn ? 'Confirm Stock IN' : 'Confirm Stock OUT'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Product Summary
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475569', marginTop: '6px' }}>
            <span>SKU: <strong className="sku-badge">{product.sku}</strong></span>
            <span>Current Stock: <strong>{currentStock} units</strong></span>
            <span>Min Threshold: <strong>{product.minimum_stock}</strong></span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            {isStockIn ? 'Quantity to Add' : 'Quantity to Remove'} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            min="1"
            max={!isStockIn ? currentStock : undefined}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError('');
            }}
            className="form-input"
            required
            autoFocus
          />
        </div>

        {/* Live Calculation Preview Card */}
        <div
          style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: isInsufficient ? '#fef2f2' : (isStockIn ? '#ecfdf5' : '#eff6ff'),
            border: `1px solid ${isInsufficient ? '#fecaca' : (isStockIn ? '#a7f3d0' : '#bfdbfe')}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isStockIn ? <ArrowUpRight color="#059669" size={20} /> : <ArrowDownLeft color={isInsufficient ? '#dc2626' : '#2563eb'} size={20} />}
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: isInsufficient ? '#991b1b' : '#334155' }}>
              Projected Stock After Operation:
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: isInsufficient ? '#dc2626' : (isStockIn ? '#047857' : '#1d4ed8') }}>
            {isInsufficient ? 'Insufficient Stock!' : `${newStock} units`}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Audit Reason / Notes</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Sales order #1042, damaged box, warehouse transfer"
            className="form-input"
          />
        </div>
      </form>
    </Modal>
  );
};
