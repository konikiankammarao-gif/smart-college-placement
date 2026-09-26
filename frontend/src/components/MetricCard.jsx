import React from 'react';

const COLOR_MAP = {
  primary: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
};

const MetricCard = ({ title, value, icon, color = '#4f46e5', subtext }) => {
  const resolvedColor = COLOR_MAP[color] || (color.startsWith('#') ? color : '#4f46e5');

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent size={22} />;
    }
    return icon;
  };

  return (
    <div className="metric-card">
      <div 
        className="metric-icon-box" 
        style={{ 
          backgroundColor: `${resolvedColor}18`, 
          color: resolvedColor 
        }}
      >
        {renderIcon()}
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
