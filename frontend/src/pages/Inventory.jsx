import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StockBadge } from '../components/Badge';
import { StockActionModal } from '../components/StockActionModal';
import { Alert } from '../components/Alert';
import api from '../services/api';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  AlertTriangle,
  CheckCircle,
  PackageX
} from 'lucide-react';

export const Inventory = () => {
  const { canStockIn, canStockOut } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Stock Modal State
  const [stockModal, setStockModal] = useState({ isOpen: false, product: null, type: 'IN' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('stock_status', statusFilter);

      const res = await api.get(`/inventory?${params.toString()}`);
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Live Inventory & Stock Operations</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
          Perform transactional Stock IN (Restock) and Stock OUT (Dispatch) operations with atomic database protection
        </p>
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Filter Tabs / Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={handleSearch} className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product SKU or name..."
              className="form-input search-input"
            />
          </div>

          <div className="filter-group">
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('')}
            >
              All Items ({inventory.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'LOW_STOCK' ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => setStatusFilter('LOW_STOCK')}
            >
              <AlertTriangle size={14} /> Low Stock
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'OUT_OF_STOCK' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
            >
              <PackageX size={14} /> Out of Stock
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'IN_STOCK' ? 'btn-success' : 'btn-outline'}`}
              onClick={() => setStatusFilter('IN_STOCK')}
            >
              <CheckCircle size={14} /> In Stock
            </button>
          </div>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading inventory items...
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <Boxes size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ fontWeight: 600, fontSize: '15px' }}>No inventory items matched your filter</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Safety Threshold</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Stock Operations</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minimum_stock;
                const isOut = item.quantity <= 0;

                return (
                  <tr key={item.id} style={{ backgroundColor: isOut ? '#fff5f5' : (isLow ? '#fffbeb' : 'inherit') }}>
                    <td>
                      <span className="sku-badge">{item.sku}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Supplier: {item.supplier_name}</div>
                    </td>
                    <td>{item.category_name}</td>
                    <td>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#0f172a') }}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td>{item.minimum_stock} units</td>
                    <td>
                      <StockBadge quantity={item.quantity} minimumStock={item.minimum_stock} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {canStockIn && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setStockModal({ isOpen: true, product: item, type: 'IN' })}
                          >
                            <ArrowUpRight size={14} /> Stock IN
                          </button>
                        )}
                        {canStockOut && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setStockModal({ isOpen: true, product: item, type: 'OUT' })}
                            disabled={item.quantity <= 0}
                          >
                            <ArrowDownLeft size={14} /> Stock OUT
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock IN / OUT Modal */}
      {stockModal.isOpen && (
        <StockActionModal
          isOpen={stockModal.isOpen}
          onClose={() => setStockModal({ isOpen: false, product: null, type: 'IN' })}
          product={stockModal.product}
          type={stockModal.type}
          onSuccess={(msg) => {
            setFeedback({ type: 'success', message: msg });
            fetchInventory();
          }}
        />
      )}
    </div>
  );
};
