import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { IconShield, IconSearch, IconClock, IconUser } from '../components/Icons';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs?limit=50');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    const matchesSearch =
      searchTerm === '' ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <Layout pageTitle="Audit Logs & Governance">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>System Audit & Compliance Logs</h2>
          <p className="page-subtitle">Authoritative audit trail recording authentications, application shortlisting, selections, and system governance.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search logs by action, user, or description..."
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
            {['ALL', 'APPLICATION', 'DRIVE', 'USER', 'INTERVIEW', 'ANNOUNCEMENT'].map((act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`btn btn-sm ${actionFilter === act ? 'btn-primary' : 'btn-outline'}`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading audit entries...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <IconShield size={24} />
          </div>
          <h3>No audit logs found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            No audit records matching your current search query.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action Event</th>
                  <th>Performed By</th>
                  <th>Entity</th>
                  <th>Event Description</th>
                  <th>IP / User Agent</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: log.action.includes('SELECTED')
                            ? '#ecfdf5'
                            : log.action.includes('SHORTLISTED')
                            ? '#eef2ff'
                            : log.action.includes('REJECTED') || log.action.includes('DELETED')
                            ? '#fef2f2'
                            : '#f8fafc',
                          color: log.action.includes('SELECTED')
                            ? '#10b981'
                            : log.action.includes('SHORTLISTED')
                            ? '#4f46e5'
                            : log.action.includes('REJECTED') || log.action.includes('DELETED')
                            ? '#ef4444'
                            : '#334155',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.userId?.name || 'System / Guest'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {log.userId?.email} {log.userId?.role ? `(${log.userId.role.replace('_', ' ')})` : ''}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                        {log.entity || 'System'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', maxWidth: '350px' }}>
                        {log.description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AuditLogs;
