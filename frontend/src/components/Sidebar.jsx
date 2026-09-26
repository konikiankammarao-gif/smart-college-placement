import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard,
  IconBriefcase,
  IconFileText,
  IconCalendar,
  IconMegaphone,
  IconMessageSquare,
  IconHelpCircle,
  IconUsers,
  IconBuilding,
  IconBarChart,
  IconAward,
  IconDownload,
  IconShield,
  IconUser,
  IconLogOut
} from './Icons';

const Sidebar = ({ isOpen }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin-dashboard';
      case 'PLACEMENT_OFFICER':
        return '/officer-dashboard';
      case 'COMPANY':
        return '/company-dashboard';
      case 'STUDENT':
      default:
        return '/student-dashboard';
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-badge">CP</div>
        <div>
          <div className="logo-text">SmartPlacement</div>
          <div className="logo-sub">Campus ERP System</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-category">Main Menu</div>

        <NavLink to={getDashboardPath()} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/drives" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconBriefcase size={18} />
          <span>Placement Drives</span>
        </NavLink>

        <NavLink to="/applications" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconFileText size={18} />
          <span>Applications</span>
        </NavLink>

        <NavLink to="/interviews" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconCalendar size={18} />
          <span>Interviews</span>
        </NavLink>

        {/* Communication & Queries */}
        <div className="menu-category">Communications</div>
        <NavLink to="/announcements" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconMegaphone size={18} />
          <span>Notice Board</span>
        </NavLink>

        <NavLink to="/messages" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconMessageSquare size={18} />
          <span>Messages</span>
        </NavLink>

        <NavLink to="/support-tickets" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <IconHelpCircle size={18} />
          <span>Placement Queries</span>
        </NavLink>

        {/* Student Specific */}
        {role === 'STUDENT' && (
          <>
            <div className="menu-category">Student Portal</div>
            <NavLink to="/student-profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconUser size={18} />
              <span>My Profile & Resume</span>
            </NavLink>
          </>
        )}

        {/* Company Specific */}
        {role === 'COMPANY' && (
          <>
            <div className="menu-category">Company Portal</div>
            <NavLink to="/company-profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconBuilding size={18} />
              <span>Company Profile</span>
            </NavLink>
          </>
        )}

        {/* Placement Officer & Super Admin */}
        {(role === 'PLACEMENT_OFFICER' || role === 'SUPER_ADMIN') && (
          <>
            <div className="menu-category">Management</div>
            <NavLink to="/students" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconUsers size={18} />
              <span>Students Directory</span>
            </NavLink>

            <NavLink to="/companies" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconBuilding size={18} />
              <span>Companies Directory</span>
            </NavLink>

            <NavLink to="/placements" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconAward size={18} />
              <span>Placed Students</span>
            </NavLink>

            <NavLink to="/reports" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconDownload size={18} />
              <span>Reports & CSV Export</span>
            </NavLink>

            <NavLink to="/analytics" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconBarChart size={18} />
              <span>Analytics & Metrics</span>
            </NavLink>
          </>
        )}

        {/* Super Admin Only */}
        {role === 'SUPER_ADMIN' && (
          <>
            <div className="menu-category">Administration</div>
            <NavLink to="/admin-settings" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconShield size={18} />
              <span>Users & System Settings</span>
            </NavLink>

            <NavLink to="/audit-logs" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <IconShield size={18} />
              <span>Audit & Compliance Logs</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="user-info">
          <div className="user-name" title={user?.name}>{user?.name}</div>
          <div className="user-role-badge">{role?.replace('_', ' ')}</div>
        </div>
        <button 
          onClick={handleLogout} 
          className="nav-icon-btn" 
          title="Logout"
          style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', color: '#94a3b8' }}
        >
          <IconLogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
