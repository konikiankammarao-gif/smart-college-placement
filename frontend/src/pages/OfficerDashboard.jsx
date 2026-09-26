import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { IconUsers, IconBuilding, IconBriefcase, IconAward, IconPlus } from '../components/Icons';
import api from '../services/api';

const OfficerDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placementRate: '0%'
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        const [dashRes, appRes] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/applications?limit=6')
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.success) {
          const d = dashRes.value.data;
          setStats({
            totalStudents: d.totalStudents || 0,
            placedStudents: d.placedStudents || 0,
            totalCompanies: d.totalCompanies || 0,
            activeDrives: d.activeDrives || 0,
            placementRate: d.placementPercentage ? `${d.placementPercentage}%` : '0%'
          });
        }
        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setRecentApplications(appRes.value.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficerData();
  }, []);

  return (
    <Layout pageTitle="Placement Officer Overview">
      {/* Officer Hero Banner */}
      <div className="portal-hero-banner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '12px', background: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', textTransform: 'uppercase' }}>
            Officer Portal
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px' }}>
            Campus Recruitment Command Center
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>
            Monitor ongoing recruitment drives, verify candidates, and track college placement KPIs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/drives" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconPlus size={16} /> Post New Drive
          </Link>
          <Link to="/students" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            Students Directory
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-responsive" style={{ marginBottom: '28px' }}>
        <MetricCard
          title="Total Registered Students"
          value={stats.totalStudents}
          icon={<IconUsers size={22} />}
          color="#4f46e5"
          subtext="Eligible batches"
        />
        <MetricCard
          title="Total Placed"
          value={stats.placedStudents}
          icon={<IconAward size={22} />}
          color="#10b981"
          subtext={`Success rate: ${stats.placementRate}`}
        />
        <MetricCard
          title="Corporate Partners"
          value={stats.totalCompanies}
          icon={<IconBuilding size={22} />}
          color="#06b6d4"
          subtext="Registered recruiters"
        />
        <MetricCard
          title="Active Placement Drives"
          value={stats.activeDrives}
          icon={<IconBriefcase size={22} />}
          color="#f59e0b"
          subtext="Currently receiving applications"
        />
      </div>

      {/* Applications Management Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Student Applications</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Latest job applications across all live company drives</p>
          </div>
          <Link to="/applications" className="btn btn-outline btn-sm">
            View All Applications
          </Link>
        </div>

        {loading ? (
          <p style={{ padding: '20px 0', color: '#94a3b8' }}>Loading applications...</p>
        ) : recentApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No recent applications found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Company & Drive</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {app.student?.user?.name || app.student?.name || 'Student'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {app.student?.department?.code || app.student?.branch || 'CSE'}
                      </div>
                    </td>
                    <td>{app.student?.rollNumber || 'N/A'}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{app.drive?.roleTitle || 'Role'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{app.drive?.company?.name || 'Company'}</div>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Link to="/applications" className="btn btn-outline btn-sm">
                        Review
                      </Link>
                    </td>
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

export default OfficerDashboard;
