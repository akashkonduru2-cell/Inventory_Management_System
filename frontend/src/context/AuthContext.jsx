import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('inventory_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('inventory_token');
      const storedUser = localStorage.getItem('inventory_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('inventory_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          localStorage.removeItem('inventory_token');
          localStorage.removeItem('inventory_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data.data;
        
        localStorage.setItem('inventory_token', receivedToken);
        localStorage.setItem('inventory_user', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      let message = 'Login failed. Please check your credentials.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = 'Cannot connect to backend server. Please verify that the backend is running on port 5000 (npm start).';
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
      setUser(null);
      setToken(null);
    }
  };

  // Role permissions helpers
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isEmployee = user?.role === 'EMPLOYEE';

  const canManageUsers = isAdmin;
  const canManageProducts = isAdmin || isManager;
  const canDeleteProduct = isAdmin;
  const canManageCategories = isAdmin || isManager;
  const canManageSuppliers = isAdmin || isManager;
  const canStockIn = isAdmin || isManager;
  const canStockOut = isAdmin || isManager || isEmployee;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isEmployee,
        canManageUsers,
        canManageProducts,
        canDeleteProduct,
        canManageCategories,
        canManageSuppliers,
        canStockIn,
        canStockOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
