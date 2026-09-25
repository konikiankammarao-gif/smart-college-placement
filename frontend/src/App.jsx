import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import StudentDashboard from './pages/StudentDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Feature Pages
import Drives from './pages/Drives';
import Applications from './pages/Applications';
import StudentProfile from './pages/StudentProfile';
import CompanyProfile from './pages/CompanyProfile';
import StudentsDirectory from './pages/StudentsDirectory';
import CompaniesDirectory from './pages/CompaniesDirectory';
import Placements from './pages/Placements';
import Analytics from './pages/Analytics';
import AdminSettings from './pages/AdminSettings';

// Helper component to redirect root "/" to user's dashboard
const RootRedirect = () => {
  const { user, role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Initializing session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Role Dashboards */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Feature Routes */}
          <Route
            path="/drives"
            element={
              <ProtectedRoute>
                <Drives />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY']}>
                <StudentsDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_OFFICER', 'STUDENT']}>
                <CompaniesDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placements"
            element={
              <ProtectedRoute>
                <Placements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_OFFICER']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-settings"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
