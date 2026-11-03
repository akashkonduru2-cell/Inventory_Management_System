import React, { useState, useEffect } from 'react';
import { TransactionBadge } from '../components/Badge';
import { formatDate } from '../utils/helpers';
import api from '../services/api';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (productFilter) params.append('product_id', productFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const [txRes, prodRes] = await Promise.all([
        api.get(`/transactions?${params.toString()}`),
        api.get('/products')
      ]);

      if (txRes.data.success) setTransactions(txRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, productFilter, startDate, endDate]);

  const filteredTransactions = transactions.filter((tx) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (tx.product_name && tx.product_name.toLowerCase().includes(term)) ||
      (tx.product_sku && tx.product_sku.toLowerCase().includes(term)) ||
      (tx.user_name && tx.user_name.toLowerCase().includes(term)) ||
      (tx.reason && tx.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Inventory Audit & Transaction Ledger</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Complete immutable audit trail of every stock modification, dispatch, and replenishment
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, reason, product..."
              className="form-input search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="">All Types (IN & OUT)</option>
              <option value="IN">Stock IN Only</option>
              <option value="OUT">Stock OUT Only</option>
            </select>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
              />
            </div>

            {(typeFilter || productFilter || startDate || endDate || search) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setTypeFilter('');
                  setProductFilter('');
                  setStartDate('');
                  setEndDate('');
                  setSearch('');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading audit transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <History size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ fontWeight: 600, fontSize: '15px' }}>No audit transactions recorded</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Timestamp</th>
                <th>Type</th>
                <th>Product</th>
                <th>Units Moved</th>
                <th>Stock Shift</th>
                <th>Recorded By</th>
                <th>Reason / Reference Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isStockIn = tx.type === 'IN';
                return (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#334155' }}>
                      {formatDate(tx.created_at)}
                    </td>
                    <td>
                      <TransactionBadge type={tx.type} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.product_name}</div>
                      <span className="sku-badge">{tx.product_sku}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px', color: isStockIn ? '#059669' : '#dc2626' }}>
                        {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </strong>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      <span>{tx.previous_quantity} units</span>
                      <span style={{ margin: '0 6px', color: '#94a3b8' }}>→</span>
                      <strong style={{ color: '#0f172a' }}>{tx.new_quantity} units</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>{tx.user_name}</div>
                      {tx.user_email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.user_email}</div>}
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '13px', color: '#475569' }}>
                      {tx.reason || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No reason recorded</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
