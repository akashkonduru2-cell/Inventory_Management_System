/**
 * Helper utility functions
 */

export const formatCurrency = (amount) => {
  const val = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const getStockStatus = (quantity, minimumStock) => {
  const qty = parseInt(quantity, 10) || 0;
  const min = parseInt(minimumStock, 10) || 0;

  if (qty <= 0) return { label: 'Out of Stock', key: 'OUT_OF_STOCK', className: 'badge-out-of-stock' };
  if (qty <= min) return { label: 'Low Stock', key: 'LOW_STOCK', className: 'badge-low-stock' };
  return { label: 'In Stock', key: 'IN_STOCK', className: 'badge-in-stock' };
};

export const getRoleDetails = (role) => {
  switch (role) {
    case 'ADMIN':
      return { label: 'Administrator', className: 'badge-admin' };
    case 'MANAGER':
      return { label: 'Manager', className: 'badge-manager' };
    case 'EMPLOYEE':
      return { label: 'Employee', className: 'badge-employee' };
    default:
      return { label: role || 'Unknown', className: 'badge-employee' };
  }
};
