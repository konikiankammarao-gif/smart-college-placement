import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { IconHelpCircle, IconPlus, IconMessageSquare, IconSend, IconClock } from '../components/Icons';
import api from '../services/api';

const SupportTickets = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'PLACEMENT_DRIVE',
    priority: 'MEDIUM',
    description: '',
  });
  const [creating, setCreating] = useState(false);

  // View / Reply Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support-tickets');
      if (res.success && res.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/support-tickets', formData);
      if (res.success && res.data) {
        setTickets([res.data, ...tickets]);
        setNewTicketModalOpen(false);
        setFormData({
          subject: '',
          category: 'PLACEMENT_DRIVE',
          priority: 'MEDIUM',
          description: '',
        });
      }
    } catch (err) {
      alert(err || 'Failed to submit query ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setStatusUpdate(ticket.status);
    setReplyText('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setReplying(true);
      const res = await api.post(`/support-tickets/${selectedTicket._id}/messages`, {
        message: replyText.trim(),
      });
      if (res.success && res.data) {
        setSelectedTicket(res.data);
        setTickets((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
        setReplyText('');
      }
    } catch (err) {
      alert(err || 'Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await api.put(`/support-tickets/${selectedTicket._id}/status`, {
        status: newStatus,
      });
      if (res.success && res.data) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
        setTickets((prev) =>
          prev.map((t) => (t._id === selectedTicket._id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      alert(err || 'Failed to update status');
    }
  };

  return (
    <Layout pageTitle="Placement Helpdesk & Grievance">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Placement Queries & Grievances</h2>
          <p className="page-subtitle">Raise verification questions, recruitment grievances, and get official resolution from placement officers.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setNewTicketModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconPlus size={16} /> Raise New Query
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <IconHelpCircle size={24} />
          </div>
          <h3>No queries submitted</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            Have a question about an upcoming drive or your profile verification? Click "Raise New Query" to contact the placement cell.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject & Category</th>
                  {role !== 'STUDENT' && <th>Created By</th>}
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Replies</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '13px' }}>
                        {t.ticketId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.subject}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t.category?.replace('_', ' ')}</div>
                    </td>
                    {role !== 'STUDENT' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.createdBy?.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t.createdBy?.role?.replace('_', ' ')}</div>
                      </td>
                    )}
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: t.priority === 'URGENT' ? '#fef2f2' : t.priority === 'HIGH' ? '#fffbeb' : '#f1f5f9',
                          color: t.priority === 'URGENT' ? '#ef4444' : t.priority === 'HIGH' ? '#f59e0b' : '#64748b',
                        }}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{t.messages?.length || 0} messages</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raise New Ticket Modal */}
      {newTicketModalOpen && (
        <Modal title="Submit Placement Query / Ticket" onClose={() => setNewTicketModalOpen(false)}>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Subject / Query Summary *</label>
              <input
                type="text"
                className="form-control"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. CGPA update after semester re-evaluation"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="PLACEMENT_DRIVE">Placement Drive Inquiry</option>
                  <option value="ELIGIBILITY">Eligibility Calculation</option>
                  <option value="APPLICATION">Application Issue</option>
                  <option value="INTERVIEW">Interview Scheduling</option>
                  <option value="PROFILE_VERIFICATION">Profile Verification</option>
                  <option value="TECHNICAL_ISSUE">Technical Platform Bug</option>
                  <option value="OTHER">Other Assistance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent (Upcoming Drive)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Detailed Description *</label>
              <textarea
                rows={4}
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain your question with relevant drive name, roll number, or details..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setNewTicketModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Details & Thread Modal */}
      {selectedTicket && (
        <Modal
          title={`Ticket ${selectedTicket.ticketId}: ${selectedTicket.subject}`}
          onClose={() => setSelectedTicket(null)}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Category: </span>
              <strong style={{ fontSize: '13px' }}>{selectedTicket.category?.replace('_', ' ')}</strong>
            </div>

            {(role === 'PLACEMENT_OFFICER' || role === 'SUPER_ADMIN') ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Status:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            ) : (
              <StatusBadge status={selectedTicket.status} />
            )}
          </div>

          {/* Conversation Messages */}
          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', padding: '8px' }}>
            {selectedTicket.messages?.map((m, idx) => {
              const sender = m.senderId || {};
              const isOfficer = sender.role === 'PLACEMENT_OFFICER' || sender.role === 'SUPER_ADMIN';
              return (
                <div
                  key={idx}
                  style={{
                    background: isOfficer ? '#eef2ff' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    borderLeft: isOfficer ? '4px solid #4f46e5' : '4px solid #94a3b8',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: isOfficer ? '#4f46e5' : '#1e293b' }}>
                      {sender.name || 'User'} {isOfficer && '(Placement Staff)'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {m.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'CLOSED' ? (
            <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Write a response or update..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button type="submit" disabled={replying || !replyText.trim()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconSend size={14} /> {replying ? 'Sending...' : 'Reply'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px', background: '#f1f5f9', borderRadius: '6px', color: '#64748b', fontSize: '12px' }}>
              This query ticket is closed.
            </div>
          )}
        </Modal>
      )}
    </Layout>
  );
};

export default SupportTickets;
