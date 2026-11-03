import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { Suppliers } from './pages/Suppliers';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { NotFound } from './pages/NotFound';

const Layout = ({ children, title }) => {
  const location = useLocation();

  // Determine dynamic title if not explicitly provided
  const getTitle = () => {
    if (title) return title;
    switch (location.pathname) {
      case '/dashboard':
        return 'Executive Dashboard';
      case '/products':
        return 'Product Management';
      case '/inventory':
        return 'Stock & Inventory Control';
      case '/transactions':
        return 'Audit Transaction Ledger';
      case '/categories':
        return 'Equipment Categories';
      case '/suppliers':
        return 'Supplier Directory';
      case '/users':
        return 'User Administration (RBAC)';
      case '/reports':
        return 'Analytics & Valuation Reports';
      default:
        return 'Inventory Master';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title={getTitle()} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suppliers />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin-Only User Management Route */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Layout>
                    <Users />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* 404 Catch All */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
