import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Auth Pages
import Landing from './pages/Landing';
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
import Interviews from './pages/Interviews';
import Announcements from './pages/Announcements';
import Messages from './pages/Messages';
import SupportTickets from './pages/SupportTickets';
import StudentProfile from './pages/StudentProfile';
import CompanyProfile from './pages/CompanyProfile';
import StudentsDirectory from './pages/StudentsDirectory';
import CompaniesDirectory from './pages/CompaniesDirectory';
import Placements from './pages/Placements';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import AdminSettings from './pages/AdminSettings';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Common & Shared Placement Modules */}
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
            path="/interviews"
            element={
              <ProtectedRoute>
                <Interviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support-tickets"
            element={
              <ProtectedRoute>
                <SupportTickets />
              </ProtectedRoute>
            }
          />

          {/* Student Specific */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* Company Specific */}
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

          {/* Directory & Placements */}
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

          {/* Reports & Analytics */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_OFFICER']}>
                <Reports />
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

          {/* Admin Administration & Auditing */}
          <Route
            path="/admin-settings"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AuditLogs />
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
