import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { IconBriefcase, IconSearch, IconPlus, IconBuilding, IconCheckCircle } from '../components/Icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Drives = () => {
  const { role, user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Post Drive Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roleTitle: '',
    jobDescription: '',
    jobType: 'FULL_TIME',
    minCgpa: 6.5,
    maxBacklogs: 0,
    ctc: '',
    workLocation: '',
    deadline: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState({ text: '', type: '' });

  // Student application state
  const [applyingId, setApplyingId] = useState(null);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await api.get('/drives');
      if (res.success && res.data) {
        setDrives(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApply = async (driveId) => {
    try {
      setApplyingId(driveId);
      const res = await api.post('/applications', { driveId });
      if (res.success) {
        setNotificationMsg({ text: 'Application submitted successfully!', type: 'success' });
        setTimeout(() => setNotificationMsg({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      setNotificationMsg({ text: err || 'Failed to submit application. Check eligibility.', type: 'danger' });
      setTimeout(() => setNotificationMsg({ text: '', type: '' }), 5000);
    } finally {
      setApplyingId(null);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const payload = {
        roleTitle: formData.roleTitle,
        jobDescription: formData.jobDescription,
        jobType: formData.jobType,
        eligibilityCriteria: {
          minCgpa: Number(formData.minCgpa),
          maxActiveBacklogs: Number(formData.maxBacklogs),
          allowedBranches: ['CSE', 'IT', 'ECE', 'ME', 'EE', 'CE']
        },
        packageDetails: {
          ctc: Number(formData.ctc) || 5,
        },
        workLocation: formData.workLocation,
        deadline: formData.deadline || new Date(Date.now() + 14 * 86400000).toISOString()
      };

      const res = await api.post('/drives', payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          roleTitle: '',
          jobDescription: '',
          jobType: 'FULL_TIME',
          minCgpa: 6.5,
          maxBacklogs: 0,
          ctc: '',
          workLocation: '',
          deadline: ''
        });
        setNotificationMsg({ text: 'Placement drive posted successfully!', type: 'success' });
        fetchDrives();
      }
    } catch (err) {
      alert(err || 'Failed to create drive');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    const matchesSearch = 
      d.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.workLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canPostDrive = ['SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'].includes(role);

  return (
    <Layout pageTitle="Placement Drives">
      {/* Toast Alert */}
      {notificationMsg.text && (
        <div style={{
          padding: '12px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          background: notificationMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: notificationMsg.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${notificationMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {notificationMsg.text}
        </div>
      )}

      {/* Header and Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search drive by role, company, or location..."
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
            style={{ width: '150px', height: '42px' }}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
        </div>

        {canPostDrive && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <IconPlus size={18} />
            <span>Post New Drive</span>
          </button>
        )}
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading placement opportunities...
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
          <IconBriefcase size={48} />
          <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>
            No Drives Found
          </h4>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredDrives.map((d) => (
            <div key={d._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '16px'
                    }}>
                      {d.company?.name ? d.company.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                        {d.company?.name || 'Partner Company'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {d.workLocation || 'Remote / Hybrid'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={d.status || 'OPEN'} />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                  {d.roleTitle}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                  {d.jobDescription || 'Exciting opportunity for final year students.'}
                </p>

                {/* Key specs badge row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                    ₹{d.packageDetails?.ctc || 6} LPA
                  </span>
                  <span style={{ fontSize: '12px', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                    Min CGPA: {d.eligibilityCriteria?.minCgpa || 6.0}
                  </span>
                  <span style={{ fontSize: '12px', background: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {d.jobType?.replace('_', ' ') || 'Full Time'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Deadline: {d.deadline ? new Date(d.deadline).toLocaleDateString() : 'Rolling'}
                </div>
                {role === 'STUDENT' ? (
                  <button
                    onClick={() => handleApply(d._id)}
                    disabled={applyingId === d._id || d.status === 'CLOSED'}
                    className="btn btn-primary btn-sm"
                  >
                    {applyingId === d._id ? 'Applying...' : 'Apply Now'}
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
                    {d.applicantsCount || 0} Applicants
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Post New Drive */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Placement Drive">
        <form onSubmit={handleCreateDrive}>
          <div className="form-group">
            <label className="form-label">Job Role Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Software Engineer / Data Analyst"
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="form-control"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="INTERN_PLUS_FULLTIME">Internship + PPO</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Package (CTC in LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 10.5"
                value={formData.ctc}
                onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Min CGPA Required</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Location</label>
            <input
              type="text"
              placeholder="e.g. Bangalore / Hyderabad / Hybrid"
              value={formData.workLocation}
              onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea
              rows="3"
              placeholder="Responsibilities, requirements, and interview procedure..."
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="btn btn-primary">
              {submitLoading ? 'Publishing...' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Drives;
