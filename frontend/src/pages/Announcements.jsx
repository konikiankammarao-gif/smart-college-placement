import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { IconMegaphone, IconPlus, IconClock, IconUser } from '../components/Icons';
import api from '../services/api';

const Announcements = () => {
  const { user, role } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Announcement Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'ALL_USERS',
    targetValue: '',
    priority: 'NORMAL',
  });
  const [publishing, setPublishing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setPublishing(true);
      const res = await api.post('/announcements', formData);
      if (res.success && res.data) {
        setAnnouncements([res.data, ...announcements]);
        setModalOpen(false);
        setFormData({
          title: '',
          content: '',
          targetType: 'ALL_USERS',
          targetValue: '',
          priority: 'NORMAL',
        });
      }
    } catch (err) {
      alert(err || 'Failed to publish announcement');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert(err || 'Failed to delete announcement');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>URGENT</span>;
      case 'HIGH':
        return <span style={{ background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>HIGH PRIORITY</span>;
      case 'NORMAL':
      default:
        return <span style={{ background: '#eef2ff', color: '#4f46e5', border: '1px solid #e0e7ff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>ANNOUNCEMENT</span>;
    }
  };

  return (
    <Layout pageTitle="Announcements & Notices">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Placement Notice Board</h2>
          <p className="page-subtitle">Official communications, drive schedules, and urgent placement updates from the placement cell.</p>
        </div>
        {(role === 'PLACEMENT_OFFICER' || role === 'SUPER_ADMIN') && (
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IconPlus size={16} /> Broadcast Notice
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <IconMegaphone size={24} />
          </div>
          <h3>No notices posted</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            There are currently no active announcements for your department or role. Check back later for campus updates.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((a) => (
            <div
              key={a._id}
              className="card"
              style={{
                borderLeft: a.priority === 'URGENT' ? '4px solid #ef4444' : a.priority === 'HIGH' ? '4px solid #f59e0b' : '4px solid #4f46e5',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getPriorityBadge(a.priority)}
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {a.title}
                  </h3>
                </div>

                {(role === 'SUPER_ADMIN' || (role === 'PLACEMENT_OFFICER' && a.createdBy?._id === user._id)) && (
                  <button
                    onClick={() => handleDelete(a._id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
              </div>

              <p style={{ color: '#334155', fontSize: '14px', lineHeight: 1.6, margin: '12px 0 16px', whiteSpace: 'pre-line' }}>
                {a.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '12px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconUser size={14} />
                  <span>Posted by <strong>{a.createdBy?.name || 'Placement Cell'}</strong> ({a.createdBy?.role?.replace('_', ' ')})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconClock size={14} />
                  <span>{new Date(a.createdAt).toLocaleDateString()} at {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Notice Modal */}
      {modalOpen && (
        <Modal title="Broadcast Campus Placement Notice" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Notice Title *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mandatory Pre-Placement Talk for 2025 Batch"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-control"
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                >
                  <option value="ALL_USERS">All Users</option>
                  <option value="ALL_STUDENTS">All Students</option>
                  <option value="ALL_RECRUITERS">All Company Recruiters</option>
                  <option value="ALL_OFFICERS">Placement Coordinators</option>
                  <option value="SPECIFIC_BATCH">Specific Batch</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>
            </div>

            {formData.targetType === 'SPECIFIC_BATCH' && (
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Batch (e.g. 2021-2025)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="2021-2025"
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Notice Content *</label>
              <textarea
                rows={4}
                className="form-control"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter complete message details, venue instructions, dress code, or mandatory requirements..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default Announcements;
