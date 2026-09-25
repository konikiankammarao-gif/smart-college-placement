import React from 'react';

const MetricCard = ({ title, value, icon, color = '#4f46e5', subtext }) => {
  return (
    <div className="metric-card">
      <div 
        className="metric-icon-box" 
        style={{ 
          backgroundColor: `${color}15`, 
          color: color 
        }}
      >
        {icon}
      </div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{title}</div>
        {subtext && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
