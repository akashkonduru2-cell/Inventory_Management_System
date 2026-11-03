import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  History,
  Tags,
  Truck,
  Users,
  BarChart3,
  Box
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Box size={22} />
        </div>
        <div className="brand-info">
          <h2>Inventory Master</h2>
          <span>Enterprise IMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Operations</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Boxes size={18} />
          <span>Stock & Inventory</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Transaction Audit</span>
        </NavLink>

        <div className="nav-section-title">Master Data</div>

        <NavLink
          to="/categories"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Tags size={18} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/suppliers"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Truck size={18} />
          <span>Suppliers</span>
        </NavLink>

        <div className="nav-section-title">Analytics & Admin</div>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Reports & Analytics</span>
        </NavLink>

        {/* User Management is only accessible to ADMIN */}
        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-snippet">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-role-badge">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
