import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={18} />,
    success: <CheckCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className={`alert alert-${type}`}>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icons[type]}</div>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
