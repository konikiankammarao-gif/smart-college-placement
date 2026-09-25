import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { IconBuilding, IconCheckCircle } from '../components/Icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    tier: 'TIER_1'
  });

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/profile');
      if (res.success && res.data) {
        const c = res.data;
        setProfile(c);
        setFormData({
          name: c.name || user?.name || '',
          industry: c.industry || '',
          website: c.website || '',
          description: c.description || '',
          location: c.location || '',
          tier: c.tier || 'TIER_1'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/companies/profile', formData);
      if (res.success) {
        setMessage('Company profile updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout pageTitle="Company Profile">
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading company details...
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '800'
            }}>
              {formData.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {formData.name || 'Company Profile'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                {formData.industry || 'Technology Partner'} • {formData.location || 'Headquarters'}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Industry Domain</label>
                <input
                  type="text"
                  placeholder="Fintech, SaaS, AI, HealthTech"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Official Website URL</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Office Location</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea
                rows="4"
                placeholder="Share your company's mission, work culture, and tech stack with potential candidates..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-control"
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '10px' }}>
              {saving ? 'Updating...' : 'Save Company Profile'}
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default CompanyProfile;
