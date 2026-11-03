import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, AlertTriangle } from 'lucide-react';
import { RoleBadge } from './Badge';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Fetch low-stock alert count for notification badge
    api.get('/inventory/low-stock')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setLowStockCount(res.data.data.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {lowStockCount > 0 && (
          <Link to="/inventory?status=LOW_STOCK" className="low-stock-pill" style={{ textDecoration: 'none' }}>
            <AlertTriangle size={15} />
            <span>{lowStockCount} Low Stock Item{lowStockCount > 1 ? 's' : ''}</span>
          </Link>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{user?.name}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</span>
          </div>
          <RoleBadge role={user?.role} />
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign Out"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
