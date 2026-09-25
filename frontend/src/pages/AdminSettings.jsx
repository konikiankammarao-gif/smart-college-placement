import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { IconShield, IconPlus, IconSearch, IconCheckCircle } from '../components/Icons';
import api from '../services/api';

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PLACEMENT_OFFICER',
    phone: ''
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      alert(err || 'Failed to toggle status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/admin/users', formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'PLACEMENT_OFFICER', phone: '' });
        setMessage('New user account provisioned successfully!');
        fetchUsers();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || '';
    const email = u.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout pageTitle="Administration & User Control">
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

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
              placeholder="Search by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', height: '42px' }}
            />
          </div>
          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '170px', height: '42px' }}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="COMPANY">Company</option>
            <option value="PLACEMENT_OFFICER">Placement Officer</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <IconPlus size={18} /> Add Platform User
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading platform accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No users found matching query.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className="status-pill neutral">{u.role}</span>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`status-pill ${u.isActive ? 'success' : 'danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        className="btn btn-outline btn-sm"
                        style={{
                          color: u.isActive ? '#ef4444' : '#10b981',
                          borderColor: u.isActive ? '#fca5a5' : '#86efac'
                        }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New User">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              placeholder="jane.doe@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                required
                placeholder="SecurePassword123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-control"
              >
                <option value="PLACEMENT_OFFICER">Placement Officer</option>
                <option value="COMPANY">Company Recruiter</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn btn-primary">
              {creating ? 'Provisioning...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminSettings;
