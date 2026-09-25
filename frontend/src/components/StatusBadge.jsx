import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStyle = (st) => {
    switch (st.toUpperCase()) {
      case 'SELECTED':
      case 'APPROVED':
      case 'OPEN':
      case 'COMPLETED':
      case 'PASSED':
      case 'PLACED':
        return 'success';
      case 'SHORTLISTED':
      case 'INTERVIEW':
      case 'UNDER_REVIEW':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return 'info';
      case 'APPLIED':
      case 'PENDING':
      case 'DRAFT':
      case 'NOT_PLACED':
        return 'warning';
      case 'REJECTED':
      case 'FAILED':
      case 'CLOSED':
        return 'danger';
      case 'WITHDRAWN':
      case 'CANCELLED':
      default:
        return 'neutral';
    }
  };

  const formatText = (st) => {
    return st.replace(/_/g, ' ');
  };

  const styleClass = getStyle(status);

  return (
    <span className={`status-pill ${styleClass}`}>
      <span className="dot-indicator"></span>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
