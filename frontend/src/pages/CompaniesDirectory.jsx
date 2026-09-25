import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { IconBuilding, IconSearch, IconExternalLink } from '../components/Icons';
import api from '../services/api';

const CompaniesDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await api.get('/companies');
        if (res.success && res.data) {
          setCompanies(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const name = c.name || '';
    const industry = c.industry || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout pageTitle="Corporate Partners Directory">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', width: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading corporate directory...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
          <IconBuilding size={42} />
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>
            No Companies Found
          </h4>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            No corporate partners match your query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCompanies.map((c) => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px'
                  }}>
                    {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {c.tier?.replace('_', ' ') || 'TIER 1'}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {c.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600', marginBottom: '10px' }}>
                  {c.industry || 'Technology & Services'}
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description || 'Global technological innovator hiring talented engineering graduates.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {c.location || 'India'}
                </span>
                {c.website && (
                  <a
                    href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Visit <IconExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default CompaniesDirectory;
