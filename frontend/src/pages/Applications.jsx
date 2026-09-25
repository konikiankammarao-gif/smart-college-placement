import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { IconFileText, IconSearch, IconCheckCircle, IconXCircle } from '../components/Icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Applications = () => {
  const { role } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Update Modal for Recruiter / Officer
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.put(`/applications/${id}/withdraw`);
      if (res.success) {
        setMessage('Application withdrawn.');
        fetchApplications();
      }
    } catch (err) {
      alert(err || 'Failed to withdraw application');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      setUpdating(true);
      const res = await api.put(`/applications/${selectedApp._id}/status`, {
        status: newStatus,
        remarks
      });
      if (res.success) {
        setSelectedApp(null);
        setRemarks('');
        setMessage(`Status updated to ${newStatus}`);
        fetchApplications();
      }
    } catch (err) {
      alert(err || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const studentName = app.student?.user?.name || app.student?.name || '';
    const rollNo = app.student?.rollNumber || '';
    const roleTitle = app.drive?.roleTitle || '';
    const companyName = app.drive?.company?.name || '';

    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isManagement = ['SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'].includes(role);

  return (
    <Layout pageTitle="Applications Manager">
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by student, roll number, role, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', height: '42px' }}
            />
          </div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px', height: '42px' }}
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading application records...
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
            <IconFileText size={42} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>
              No Applications Found
            </h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              No applications match your filter query.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {isManagement && <th>Candidate</th>}
                  <th>Role & Company</th>
                  {isManagement && <th>Academic Info</th>}
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Remarks / Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    {isManagement && (
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          {app.student?.user?.name || app.student?.name || 'Applicant'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Roll: {app.student?.rollNumber || 'N/A'} • {app.student?.department?.code || app.student?.branch || 'Engg'}
                        </div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {app.drive?.roleTitle || 'Placement Drive'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {app.drive?.company?.name || 'Corporate'} • ₹{app.drive?.packageDetails?.ctc || 6} LPA
                      </div>
                    </td>
                    {isManagement && (
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          CGPA: <strong>{app.student?.academic?.cgpa || app.student?.cgpa || '8.0'}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Active Backlogs: {app.student?.academic?.activeBacklogs || 0}
                        </div>
                      </td>
                    )}
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ fontSize: '12px', color: '#64748b', maxWidth: '200px' }}>
                      {app.feedback || app.remarks || '—'}
                    </td>
                    <td>
                      {isManagement ? (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setNewStatus(app.status);
                            setRemarks(app.remarks || '');
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          Update Status
                        </button>
                      ) : (
                        app.status === 'APPLIED' && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                          >
                            Withdraw
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Update Application Status">
          <form onSubmit={handleStatusUpdate}>
            <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>
                {selectedApp.student?.user?.name || selectedApp.student?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Drive: {selectedApp.drive?.roleTitle} ({selectedApp.drive?.company?.name})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-control"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="SELECTED">SELECTED (OFFER EXTENDED)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback / Remarks</label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Interview scheduled time, test link, or round evaluation notes..."
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={updating} className="btn btn-primary">
                {updating ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default Applications;
