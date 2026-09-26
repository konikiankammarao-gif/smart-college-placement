import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import { IconShield, IconUsers, IconBuilding, IconBarChart, IconBriefcase } from '../components/Icons';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placedStudents: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashRes, usersRes] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/admin/users?limit=6')
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.success) {
          const d = dashRes.value.data;
          setStats({
            totalUsers: d.totalStudents + d.totalCompanies + 2,
            totalStudents: d.totalStudents || 0,
            totalCompanies: d.totalCompanies || 0,
            activeDrives: d.activeDrives || 0,
            placedStudents: d.placedStudents || 0
          });
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.success) {
          setRecentUsers(usersRes.value.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <Layout pageTitle="Super Administrator Hub">
      <div className="portal-hero-banner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '12px', background: '#ec4899', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', textTransform: 'uppercase' }}>
            System Root
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px' }}>
            Smart Placement System Governance
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '2px' }}>
            System health, database configuration, security logs, and role provisioning.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin-settings" className="btn btn-primary" style={{ background: '#ec4899', borderColor: '#ec4899' }}>
            User & System Control
          </Link>
          <Link to="/analytics" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            Deep Analytics
          </Link>
        </div>
      </div>

      <div className="grid-responsive" style={{ marginBottom: '28px' }}>
        <MetricCard
          title="Student Population"
          value={stats.totalStudents}
          icon={<IconUsers size={22} />}
          color="#4f46e5"
          subtext="Enrolled batch"
        />
        <MetricCard
          title="Partner Companies"
          value={stats.totalCompanies}
          icon={<IconBuilding size={22} />}
          color="#06b6d4"
          subtext="Active recruiters"
        />
        <MetricCard
          title="Active Drives"
          value={stats.activeDrives}
          icon={<IconBriefcase size={22} />}
          color="#f59e0b"
          subtext="Recruitment pipeline"
        />
        <MetricCard
          title="Total Offers"
          value={stats.placedStudents}
          icon={<IconShield size={22} />}
          color="#10b981"
          subtext="Successful placements"
        />
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Account Registrations</h3>
          <Link to="/admin-settings" className="btn btn-outline btn-sm">Manage All Users</Link>
        </div>

        {loading ? (
          <p style={{ padding: '20px 0', color: '#94a3b8' }}>Loading accounts...</p>
        ) : recentUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No accounts found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="status-pill neutral">{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.isActive ? 'success' : 'danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
