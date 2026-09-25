import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { IconBriefcase, IconFileText, IconAward, IconCheckCircle, IconTrendingUp } from '../components/Icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, appRes, driveRes] = await Promise.allSettled([
          api.get('/students/profile'),
          api.get('/applications'),
          api.get('/drives?status=OPEN&limit=5')
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success) {
          setProfile(profRes.value.data);
        }
        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setApplications(appRes.value.data || []);
        }
        if (driveRes.status === 'fulfilled' && driveRes.value.success) {
          setDrives(driveRes.value.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApplied = applications.length;
  const shortlistedCount = applications.filter(a => ['SHORTLISTED', 'INTERVIEW'].includes(a.status)).length;
  const offersCount = applications.filter(a => a.status === 'SELECTED').length;

  return (
    <Layout pageTitle="Student Placement Portal">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: '#e0e7ff', fontSize: '14px', marginTop: '4px' }}>
            Roll No: {profile?.rollNumber || 'Not set'} • {profile?.department?.name || profile?.branch || 'Engineering'} • CGPA: <strong>{profile?.academic?.cgpa || profile?.cgpa || 'N/A'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/drives" className="btn btn-primary" style={{ background: '#ffffff', color: '#4f46e5', fontWeight: '700' }}>
            Browse Drives
          </Link>
          <Link to="/student-profile" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' }}>
            Update Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-responsive" style={{ marginBottom: '28px' }}>
        <MetricCard
          title="Applications Sent"
          value={totalApplied}
          icon={<IconFileText size={22} />}
          color="#3b82f6"
          subtext="Total drives applied"
        />
        <MetricCard
          title="Shortlisted / Interview"
          value={shortlistedCount}
          icon={<IconTrendingUp size={22} />}
          color="#f59e0b"
          subtext="Active pipeline stages"
        />
        <MetricCard
          title="Job Offers"
          value={offersCount}
          icon={<IconAward size={22} />}
          color="#10b981"
          subtext="Final selections received"
        />
        <MetricCard
          title="Placement Status"
          value={profile?.isPlaced ? 'PLACED' : 'IN PROGRESS'}
          icon={<IconCheckCircle size={22} />}
          color={profile?.isPlaced ? '#10b981' : '#6366f1'}
          subtext={profile?.isPlaced ? 'Congratulations!' : 'Keep applying'}
        />
      </div>

      {/* Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Applications Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>My Recent Applications</h3>
            <Link to="/applications" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600' }}>View All →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>Loading applications...</p>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
              <IconFileText size={36} />
              <p style={{ marginTop: '8px', fontSize: '14px' }}>You haven't applied to any drives yet.</p>
              <Link to="/drives" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex' }}>Explore Drives</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.slice(0, 5).map((app) => (
                <div key={app._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      {app.drive?.roleTitle || 'Placement Drive'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {app.drive?.company?.name || 'Company'} • ₹{app.drive?.packageDetails?.ctc || 'N/A'} LPA
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Opportunities Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Active Campus Drives</h3>
            <Link to="/drives" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600' }}>All Drives →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', padding: '16px 0' }}>Loading opportunities...</p>
          ) : drives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
              <IconBriefcase size={36} />
              <p style={{ marginTop: '8px', fontSize: '14px' }}>No active drives currently open.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {drives.map((d) => (
                <div key={d._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      {d.roleTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {d.company?.name || 'Partner Company'} • Min CGPA: {d.eligibilityCriteria?.minCgpa || 6.0}
                    </div>
                  </div>
                  <Link to="/drives" className="btn btn-outline btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
