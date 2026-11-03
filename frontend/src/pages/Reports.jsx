import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';
import {
  TrendingUp,
  IndianRupee,
  Package,
  Layers,
  AlertTriangle,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/reports');
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Compiling inventory analytics...</p>
        </div>
      </div>
    );
  }

  const { stats, categoryDistribution = [], topMovedProducts = [] } = reportData || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Inventory Valuation & Movement Analytics</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
            Comprehensive analytics, stock turnover metrics, and warehouse valuation
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-secondary btn-sm">
          <Printer size={15} /> Print / Export Report
        </button>
      </div>

      {/* Valuation & Turnover KPIs */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Inventory Valuation</span>
            <span className="stat-value">{formatCurrency(stats?.totalStockValue || 0)}</span>
            <span className="stat-subtext">Across {stats?.totalStock || 0} physical units</span>
          </div>
          <div className="stat-icon emerald">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Stock Intake (IN)</span>
            <span className="stat-value" style={{ color: '#059669' }}>
              +{stats?.totalInUnits?.toLocaleString() || 0}
            </span>
            <span className="stat-subtext">Total replenished units</span>
          </div>
          <div className="stat-icon emerald">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Stock Dispatched (OUT)</span>
            <span className="stat-value" style={{ color: '#dc2626' }}>
              -{stats?.totalOutUnits?.toLocaleString() || 0}
            </span>
            <span className="stat-subtext">Total fulfilled units</span>
          </div>
          <div className="stat-icon rose">
            <TrendingUp size={22} style={{ transform: 'rotate(180deg)' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Low Stock Vulnerability</span>
            <span className="stat-value" style={{ color: (stats?.lowStockCount || 0) > 0 ? '#d97706' : '#059669' }}>
              {stats?.lowStockCount || 0} SKUs
            </span>
            <span className="stat-subtext">At or below minimum threshold</span>
          </div>
          <div className="stat-icon amber">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Category Financial Valuation Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Inventory Value by Category (₹)</h3>
            <p className="card-subtitle">Monetary valuation distribution across all product categories</p>
          </div>
          <Layers size={18} color="#64748b" />
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDistribution} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="category_name" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total Value']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="total_value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Moved Products Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Top 5 Most Frequently Moved Products</h3>
            <p className="card-subtitle">High-velocity items with highest cumulative transaction throughput</p>
          </div>
          <Package size={18} color="#64748b" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Total Operations</th>
                <th>Total Volume Moved</th>
                <th>In Units (+)</th>
                <th>Out Units (-)</th>
              </tr>
            </thead>
            <tbody>
              {topMovedProducts.map((p) => (
                <tr key={p.product_id}>
                  <td>
                    <span className="sku-badge">{p.product_sku}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.product_name}</td>
                  <td>{p.total_transactions} transactions</td>
                  <td>
                    <strong style={{ color: '#2563eb' }}>{p.total_units_moved} units</strong>
                  </td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>+{p.in_units}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>-{p.out_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
