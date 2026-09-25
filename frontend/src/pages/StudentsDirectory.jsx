import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { IconSearch, IconUsers, IconCheckCircle } from '../components/Icons';
import api from '../services/api';

const StudentsDirectory = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleVerify = async (id) => {
    try {
      const res = await api.put(`/students/${id}/verify`);
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isVerified: true } : s))
        );
      }
    } catch (err) {
      alert(err || 'Failed to verify student');
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = s.user?.name || s.name || '';
    const roll = s.rollNumber || '';
    const dept = s.department?.code || s.branch || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PLACED' && s.isPlaced) ||
      (statusFilter === 'UNPLACED' && !s.isPlaced);

    const matchesDept = deptFilter === 'ALL' || dept === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <Layout pageTitle="Students Directory">
      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '700px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', height: '42px' }}
            />
          </div>
          <select
            className="form-control"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ width: '140px', height: '42px' }}
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="EE">EE</option>
            <option value="CE">CE</option>
          </select>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px', height: '42px' }}
          >
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed</option>
            <option value="UNPLACED">Unplaced</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading students directory...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
            <IconUsers size={42} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>
              No Students Found
            </h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              No student profiles match your search criteria.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {s.user?.name || s.name || 'Student'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {s.user?.email || ''}
                      </div>
                    </td>
                    <td>{s.rollNumber || 'N/A'}</td>
                    <td>
                      <span className="status-pill neutral">
                        {s.department?.code || s.branch || 'CSE'}
                      </span>
                    </td>
                    <td>
                      <strong>{s.academic?.cgpa || s.cgpa || '8.0'}</strong>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Array.isArray(s.skills) && s.skills.slice(0, 3).map((sk, idx) => (
                          <span key={idx} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={s.isPlaced ? 'PLACED' : 'IN_PROGRESS'} />
                    </td>
                    <td>
                      {s.isVerified ? (
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconCheckCircle size={14} /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerify(s._id)}
                          className="btn btn-outline btn-sm"
                        >
                          Verify
                        </button>
                      )}
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

export default StudentsDirectory;
