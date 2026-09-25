import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { IconUser, IconFileText, IconCheckCircle } from '../components/Icons';
import api from '../services/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [formData, setFormData] = useState({
    rollNumber: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    activeBacklogs: 0,
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/profile');
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setFormData({
          rollNumber: p.rollNumber || '',
          cgpa: p.academic?.cgpa || p.cgpa || '',
          tenthPercentage: p.academic?.tenthPercentage || '',
          twelfthPercentage: p.academic?.twelfthPercentage || '',
          activeBacklogs: p.academic?.activeBacklogs || 0,
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || ''),
          linkedinUrl: p.socialProfiles?.linkedin || '',
          githubUrl: p.socialProfiles?.github || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        rollNumber: formData.rollNumber,
        academic: {
          cgpa: Number(formData.cgpa),
          tenthPercentage: Number(formData.tenthPercentage),
          twelfthPercentage: Number(formData.twelfthPercentage),
          activeBacklogs: Number(formData.activeBacklogs),
        },
        skills: skillsArray,
        socialProfiles: {
          linkedin: formData.linkedinUrl,
          github: formData.githubUrl,
        }
      };

      const res = await api.put('/students/profile', payload);
      if (res.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        fetchProfile();
      }
    } catch (err) {
      setMessage({ text: err || 'Failed to update profile', type: 'danger' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    try {
      setUploadingResume(true);
      const data = new FormData();
      data.append('resume', resumeFile);

      const res = await api.post('/students/resume', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        setMessage({ text: 'Resume uploaded successfully!', type: 'success' });
        setResumeFile(null);
        fetchProfile();
      }
    } catch (err) {
      setMessage({ text: err || 'Resume upload failed', type: 'danger' });
    } finally {
      setUploadingResume(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <Layout pageTitle="Student Profile & Resume">
      {message.text && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading profile details...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Main Info Form */}
          <div className="card" style={{ flex: '2' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              Academic & Personal Information
            </h3>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.user?.name || profile?.name || ''}
                    className="form-control"
                    style={{ background: '#f8fafc' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.user?.email || ''}
                    className="form-control"
                    style={{ background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">College Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current CGPA (out of 10) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">10th Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tenthPercentage}
                    onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">12th Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.twelfthPercentage}
                    onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.activeBacklogs}
                    onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, MongoDB, Docker, Git"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '10px' }}>
                {saving ? 'Updating...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Right Column: Verification & Resume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Verification Status Card */}
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
                Placement Verification
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Officer Verification:</span>
                <span className={`status-pill ${profile?.isVerified ? 'success' : 'warning'}`}>
                  {profile?.isVerified ? 'VERIFIED' : 'PENDING APPROVAL'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Placement Status:</span>
                <StatusBadge status={profile?.isPlaced ? 'PLACED' : 'IN_PROGRESS'} />
              </div>
            </div>

            {/* Resume Upload Card */}
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
                Resume & Portfolio
              </h4>
              {profile?.resumeUrl ? (
                <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: '600', fontSize: '13px' }}>
                    <IconFileText size={18} /> Resume on file
                  </div>
                  <a
                    href={profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `${profile.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', fontSize: '12px', color: '#4f46e5', fontWeight: '600', marginTop: '6px' }}
                  >
                    View Current Resume ↗
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  No resume attached yet. Upload a PDF resume for recruiter evaluations.
                </p>
              )}

              <form onSubmit={handleResumeUpload}>
                <div className="form-group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="form-control"
                    style={{ fontSize: '12px', padding: '8px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingResume || !resumeFile}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentProfile;
