import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e2e8f0', 
            borderTopColor: '#4f46e5', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite' 
          }} />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading placement portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to their default dashboard if role not permitted
    switch (role) {
      case 'SUPER_ADMIN':
        return <Navigate to="/admin-dashboard" replace />;
      case 'PLACEMENT_OFFICER':
        return <Navigate to="/officer-dashboard" replace />;
      case 'COMPANY':
        return <Navigate to="/company-dashboard" replace />;
      case 'STUDENT':
      default:
        return <Navigate to="/student-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
