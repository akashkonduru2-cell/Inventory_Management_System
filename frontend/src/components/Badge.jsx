import React from 'react';
import { getStockStatus, getRoleDetails } from '../utils/helpers';

export const StockBadge = ({ quantity, minimumStock }) => {
  const status = getStockStatus(quantity, minimumStock);
  return (
    <span className={`badge ${status.className}`}>
      {status.label}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const details = getRoleDetails(role);
  return (
    <span className={`badge ${details.className}`}>
      {details.label}
    </span>
  );
};

export const TransactionBadge = ({ type }) => {
  const isStockIn = type === 'IN';
  return (
    <span className={`badge ${isStockIn ? 'badge-in' : 'badge-out'}`}>
      {isStockIn ? '↑ STOCK IN' : '↓ STOCK OUT'}
    </span>
  );
};

export const StatusBadge = ({ isActive }) => {
  return (
    <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
      {isActive ? '● Active' : '○ Deactivated'}
    </span>
  );
};
