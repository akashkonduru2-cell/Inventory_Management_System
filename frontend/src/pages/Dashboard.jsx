import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StockBadge, TransactionBadge } from '../components/Badge';
import { StockActionModal } from '../components/StockActionModal';
import { Alert } from '../components/Alert';
import { formatCurrency, formatDate } from '../utils/helpers';
import api from '../services/api';
import {
  Package,
  Boxes,
  AlertTriangle,
  History,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { user, canStockIn, canStockOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal State
  const [stockModal, setStockModal] = useState({ isOpen: false, product: null, type: 'IN' });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, lowStockRes, reportsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-transactions?limit=6'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/reports')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (recentRes.data.success) setRecentTransactions(recentRes.data.data);
      if (lowStockRes.data.success) setLowStockProducts(lowStockRes.data.data);
      if (reportsRes.data.success) {
        setCategoryData(reportsRes.data.data.categoryDistribution || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStockActionSuccess = (msg) => {
    setFeedback({ type: 'success', message: msg });
    fetchDashboardData();
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  const movementPieData = stats ? [
    { name: 'Stock IN (Units)', value: stats.totalInUnits || 0, color: '#10b981' },
    { name: 'Stock OUT (Units)', value: stats.totalOutUnits || 0, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
            Here is your live inventory status, warehouse movements, and low stock indicators.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/products" className="btn btn-outline btn-sm">
            <Package size={15} /> View Products
          </Link>
          {canStockIn && (
            <Link to="/inventory" className="btn btn-primary btn-sm">
              <Boxes size={15} /> Manage Stock
            </Link>
          )}
        </div>
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* 4 KPI Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtext={`Across ${stats?.totalCategories || 0} categories`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Inventory Units"
          value={stats?.totalStock?.toLocaleString() || 0}
          subtext={`Est. Value: ${formatCurrency(stats?.totalStockValue || 0)}`}
          icon={Boxes}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount || 0}
          subtext={stats?.lowStockCount > 0 ? 'Requires immediate restock' : 'All stocks healthy'}
          icon={AlertTriangle}
          color={stats?.lowStockCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Total Audit Transactions"
          value={stats?.totalTransactions || 0}
          subtext={`${stats?.totalInUnits || 0} IN / ${stats?.totalOutUnits || 0} OUT`}
          icon={History}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Category Stock Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Stock Units by Category</h3>
              <p className="card-subtitle">Volume distribution across product categories</p>
            </div>
            <BarChart2 size={18} color="#64748b" />
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category_name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Total Stock']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total_stock" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock IN vs OUT Volume */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Stock Movement Ratio</h3>
              <p className="card-subtitle">Lifetime units received vs dispatched</p>
            </div>
            <TrendingUp size={18} color="#64748b" />
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movementPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {movementPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock & Recent Transactions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Low Stock Warning Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#d97706" />
                <span>Low Stock Warnings</span>
              </h3>
              <p className="card-subtitle">Items at or below safety threshold</p>
            </div>
            <Link to="/inventory?status=LOW_STOCK" className="btn btn-outline btn-sm" style={{ fontSize: '12px' }}>
              View All
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
              <div style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <p style={{ fontWeight: 600 }}>All stock levels are optimal</p>
              <p style={{ fontSize: '12px' }}>No products are currently under their minimum thresholds.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current</th>
                    <th>Min</th>
                    <th>Status</th>
                    {canStockIn && <th>Quick Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                        <span className="sku-badge">{p.sku}</span>
                      </td>
                      <td>
                        <strong style={{ color: p.quantity <= 0 ? '#ef4444' : '#d97706' }}>
                          {p.quantity}
                        </strong>
                      </td>
                      <td>{p.minimum_stock}</td>
                      <td>
                        <StockBadge quantity={p.quantity} minimumStock={p.minimum_stock} />
                      </td>
                      {canStockIn && (
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setStockModal({ isOpen: true, product: p, type: 'IN' })}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            + Stock IN
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions Feed */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Stock Activity</h3>
              <p className="card-subtitle">Latest inventory audit transactions</p>
            </div>
            <Link to="/transactions" className="btn btn-outline btn-sm" style={{ fontSize: '12px' }}>
              Full Ledger <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>User</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.product_name}</div>
                      <span className="sku-badge">{tx.product_sku}</span>
                    </td>
                    <td>
                      <TransactionBadge type={tx.type} />
                    </td>
                    <td>
                      <strong>{tx.quantity}</strong>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{tx.user_name}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock IN / OUT Modal */}
      {stockModal.isOpen && (
        <StockActionModal
          isOpen={stockModal.isOpen}
          onClose={() => setStockModal({ isOpen: false, product: null, type: 'IN' })}
          product={stockModal.product}
          type={stockModal.type}
          onSuccess={handleStockActionSuccess}
        />
      )}
    </div>
  );
};
