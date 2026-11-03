import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return fallback;

    return (
      <div className="card" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '40px 30px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Access Denied (403 Forbidden)</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          Your role (<strong style={{ color: '#0f172a' }}>{user?.role}</strong>) does not have authorization to view or manage this administrative module. Required roles: {allowedRoles.join(', ')}.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return children;
};
