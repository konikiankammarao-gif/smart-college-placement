import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({
        ...formData,
        role,
      });

      if (user.role === 'COMPANY') {
        navigate('/company-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-brand">
          <div className="logo-badge">CP</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Create Portal Account
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Sign up to access drives, recruitment, and placement tools
          </p>
        </div>

        {/* Role toggle tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: role === 'STUDENT' ? '#ffffff' : 'transparent',
              color: role === 'STUDENT' ? '#4f46e5' : '#64748b',
              boxShadow: role === 'STUDENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🎓 I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('COMPANY')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: role === 'COMPANY' ? '#ffffff' : 'transparent',
              color: role === 'COMPANY' ? '#4f46e5' : '#64748b',
              boxShadow: role === 'COMPANY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🏢 I am a Company Recruiter
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '18px',
              fontWeight: '500',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">
              {role === 'STUDENT' ? 'Full Name' : 'Company Name'}
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder={role === 'STUDENT' ? 'e.g. John Doe' : 'e.g. Acme Corporation'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {role === 'STUDENT' ? 'College Email Address' : 'Corporate Email Address'}
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder={role === 'STUDENT' ? 'student@college.edu' : 'hr@company.com'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 characters)</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              minLength="6"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'STUDENT' ? 'Student' : 'Company'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
