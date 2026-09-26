import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { IconCalendar, IconClock, IconPlus, IconExternalLink, IconCheckCircle, IconSearch } from '../components/Icons';
import api from '../services/api';

const Interviews = () => {
  const { user, role } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Update Status Modal
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: 'COMPLETED',
    score: '',
    feedback: '',
  });
  const [updating, setUpdating] = useState(false);

  // New Interview Modal (for Officer / Company)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    roundName: 'Technical Interview 1',
    roundType: 'TECHNICAL',
    roundNumber: 1,
    scheduledDate: '',
    scheduledTime: '10:00 AM',
    duration: 45,
    location: 'Virtual',
    meetingLink: '',
    interviewer: '',
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interviews');
      if (res.success && res.data) {
        setInterviews(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsForScheduling = async () => {
    try {
      const res = await api.get('/applications?status=SHORTLISTED');
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
    if (role === 'PLACEMENT_OFFICER' || role === 'COMPANY' || role === 'SUPER_ADMIN') {
      fetchApplicationsForScheduling();
    }
  }, [role]);

  const handleOpenUpdate = (interview) => {
    setSelectedInterview(interview);
    setUpdateForm({
      status: interview.status || 'COMPLETED',
      score: interview.score || '',
      feedback: interview.feedback || '',
    });
    setUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setUpdating(true);
      const res = await api.put(`/interviews/${selectedInterview._id}`, updateForm);
      if (res.success) {
        setInterviews((prev) =>
          prev.map((i) => (i._id === selectedInterview._id ? { ...i, ...res.data } : i))
        );
        setUpdateModalOpen(false);
      }
    } catch (err) {
      alert(err || 'Failed to update interview');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setScheduling(true);
      const res = await api.post('/interviews', scheduleForm);
      if (res.success) {
        setScheduleModalOpen(false);
        fetchInterviews();
        setScheduleForm({
          applicationId: '',
          roundName: 'Technical Interview 1',
          roundType: 'TECHNICAL',
          roundNumber: 1,
          scheduledDate: '',
          scheduledTime: '10:00 AM',
          duration: 45,
          location: 'Virtual',
          meetingLink: '',
          interviewer: '',
        });
      }
    } catch (err) {
      alert(err || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      i.roundName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.driveId?.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.studentId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Layout pageTitle="Interview Management">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Interview Rounds & Schedules</h2>
          <p className="page-subtitle">Track recruitment rounds, evaluation feedback, and virtual meeting links.</p>
        </div>
        {(role === 'PLACEMENT_OFFICER' || role === 'COMPANY' || role === 'SUPER_ADMIN') && (
          <button className="btn btn-primary" onClick={() => setScheduleModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconPlus size={16} /> Schedule Interview
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by company, candidate, or round..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px' }}
            />
            <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>
              <IconSearch size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'SCHEDULED', 'COMPLETED', 'PASSED', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interviews Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading interview schedules...
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <IconCalendar size={24} />
          </div>
          <h3>No interview rounds found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            There are currently no interviews matching your criteria. Once shortlisted, candidate interview rounds will appear here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Round & Role</th>
                  {role !== 'STUDENT' && <th>Candidate</th>}
                  <th>Company</th>
                  <th>Date & Time</th>
                  <th>Location / Link</th>
                  <th>Status</th>
                  <th>Score / Feedback</th>
                  {(role === 'PLACEMENT_OFFICER' || role === 'COMPANY' || role === 'SUPER_ADMIN') && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((i) => (
                  <tr key={i._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.roundName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Round #{i.roundNumber} ({i.roundType})</div>
                    </td>
                    {role !== 'STUDENT' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{i.studentId?.userId?.name || 'Candidate'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{i.studentId?.userId?.email}</div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: 600 }}>{i.driveId?.companyId?.companyName || 'Campus Recruiter'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{i.driveId?.jobTitle}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <IconCalendar size={14} />
                        {i.scheduledDate ? new Date(i.scheduledDate).toLocaleDateString() : 'TBD'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        <IconClock size={12} />
                        {i.scheduledTime || '10:00 AM'} ({i.duration || 45} mins)
                      </div>
                    </td>
                    <td>
                      {i.meetingLink ? (
                        <a
                          href={i.meetingLink.startsWith('http') ? i.meetingLink : `https://${i.meetingLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px' }}
                        >
                          Join Call <IconExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{i.location || 'Campus / TBD'}</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={i.status} />
                    </td>
                    <td>
                      {i.score ? <span style={{ fontWeight: 700, color: '#4f46e5' }}>{i.score}/100 </span> : null}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{i.feedback || 'Pending evaluation'}</span>
                    </td>
                    {(role === 'PLACEMENT_OFFICER' || role === 'COMPANY' || role === 'SUPER_ADMIN') && (
                      <td>
                        <button
                          onClick={() => handleOpenUpdate(i)}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          Update Result
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Interview Result Modal */}
      {updateModalOpen && (
        <Modal title="Update Interview Evaluation" onClose={() => setUpdateModalOpen(false)}>
          <form onSubmit={handleSaveUpdate}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Evaluation Status</label>
              <select
                className="form-control"
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PASSED">PASSED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Score (out of 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={updateForm.score}
                onChange={(e) => setUpdateForm({ ...updateForm, score: e.target.value })}
                placeholder="e.g. 85"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Interviewer Feedback & Remarks</label>
              <textarea
                rows={3}
                className="form-control"
                value={updateForm.feedback}
                onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
                placeholder="Detailed remarks on candidate performance and readiness for next round..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setUpdateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Saving...' : 'Save Result'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <Modal title="Schedule Interview Round" onClose={() => setScheduleModalOpen(false)}>
          <form onSubmit={handleScheduleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Select Shortlisted Candidate / Drive *</label>
              <select
                className="form-control"
                value={scheduleForm.applicationId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, applicationId: e.target.value })}
                required
              >
                <option value="">-- Choose Candidate Application --</option>
                {applications.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.studentId?.userId?.name || app.student?.name} - {app.driveId?.companyId?.companyName || app.drive?.company?.name} ({app.driveId?.jobTitle || app.drive?.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Round Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={scheduleForm.roundName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, roundName: e.target.value })}
                  placeholder="e.g. Technical Round 1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Round Type</label>
                <select
                  className="form-control"
                  value={scheduleForm.roundType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, roundType: e.target.value })}
                >
                  <option value="APTITUDE">APTITUDE</option>
                  <option value="CODING">CODING</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="HR">HR</option>
                  <option value="MANAGERIAL">MANAGERIAL</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Scheduled Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time & Duration</label>
                <input
                  type="text"
                  className="form-control"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                  placeholder="e.g. 10:30 AM"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Virtual Meeting Link / Venue</label>
              <input
                type="text"
                className="form-control"
                value={scheduleForm.meetingLink}
                onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/xyz or Seminar Hall B"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Interviewer Name / Designation</label>
              <input
                type="text"
                className="form-control"
                value={scheduleForm.interviewer}
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer: e.target.value })}
                placeholder="e.g. Lead Engineer / HR Director"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={scheduling}>
                {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default Interviews;
