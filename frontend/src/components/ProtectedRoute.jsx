import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  const storedToken = localStorage.getItem('token');
  const storedUserRaw = localStorage.getItem('user');
  let parsedStoredUser = null;
  try {
    parsedStoredUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    parsedStoredUser = null;
  }

  // If initial auth check is in progress and we have no credentials at all, show simple loader
  if (loading && !storedToken) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading placement portal...</p>
        </div>
      </div>
    );
  }

  const effectiveAuth = isAuthenticated || (Boolean(storedToken) && Boolean(parsedStoredUser));
  if (!effectiveAuth) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = role || parsedStoredUser?.role;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    // Redirect to their default dashboard if role not permitted
    switch (effectiveRole) {
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
