import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'blue' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};
