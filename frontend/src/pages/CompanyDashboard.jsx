import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { IconBriefcase, IconUsers, IconAward, IconCheckCircle, IconPlus } from '../components/Icons';
import api from '../services/api';

const CompanyDashboard = () => {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const [drivesRes, appsRes] = await Promise.allSettled([
          api.get('/drives'),
          api.get('/applications')
        ]);

        if (drivesRes.status === 'fulfilled' && drivesRes.value.success) {
          setDrives(drivesRes.value.data || []);
        }
        if (appsRes.status === 'fulfilled' && appsRes.value.success) {
          setApplications(appsRes.value.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, []);

  const totalDrives = drives.length;
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter(a => ['SHORTLISTED', 'INTERVIEW'].includes(a.status)).length;
  const hiredCount = applications.filter(a => a.status === 'SELECTED').length;

  return (
    <Layout pageTitle="Recruiter Dashboard">
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Corporate Recruiter Workspace</h2>
          <p style={{ color: '#e0f2fe', fontSize: '14px', marginTop: '4px' }}>
            Publish campus drives, evaluate student talent, and schedule interviews.
          </p>
        </div>
        <div>
          <Link to="/drives" className="btn btn-primary" style={{ background: '#ffffff', color: '#0369a1', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconPlus size={16} /> Create Campus Drive
          </Link>
        </div>
      </div>

      <div className="grid-responsive" style={{ marginBottom: '28px' }}>
        <MetricCard
          title="Active Drives"
          value={totalDrives}
          icon={<IconBriefcase size={22} />}
          color="#0284c7"
          subtext="Current openings"
        />
        <MetricCard
          title="Candidate Applications"
          value={totalApplicants}
          icon={<IconUsers size={22} />}
          color="#6366f1"
          subtext="Total applicants received"
        />
        <MetricCard
          title="Shortlisted for Interview"
          value={shortlistedCount}
          icon={<IconCheckCircle size={22} />}
          color="#f59e0b"
          subtext="Under evaluation"
        />
        <MetricCard
          title="Offers Made"
          value={hiredCount}
          icon={<IconAward size={22} />}
          color="#10b981"
          subtext="Selected candidates"
        />
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Candidate Pipeline</h3>
          <Link to="/applications" className="btn btn-outline btn-sm">Manage All Applications</Link>
        </div>

        {loading ? (
          <p style={{ padding: '20px 0', color: '#94a3b8' }}>Loading candidates...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
            No candidate applications received yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Drive / Role</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 6).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {app.student?.user?.name || app.student?.name || 'Candidate'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {app.student?.rollNumber || 'Roll No'} • {app.student?.department?.code || 'CSE'}
                      </div>
                    </td>
                    <td>{app.drive?.roleTitle || 'Job Drive'}</td>
                    <td><strong>{app.student?.academic?.cgpa || app.student?.cgpa || '8.0'}</strong></td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Link to="/applications" className="btn btn-outline btn-sm">
                        Evaluate
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

export default CompanyDashboard;
