import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import { IconDownload, IconAward, IconBarChart, IconUsers, IconBuilding } from '../components/Icons';
import api from '../services/api';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/export-csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campus_placement_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export CSV report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout pageTitle="Placement Reports & Accreditation">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Campus Placement Reports</h2>
          <p className="page-subtitle">Department statistics, package distributions, and downloadable NAAC/NIRF accreditation reports.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleDownloadCSV}
          disabled={downloading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconDownload size={16} />
          {downloading ? 'Exporting...' : 'Export Placements CSV'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Generating placement metrics...
        </div>
      ) : !report ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          Failed to load placement reports.
        </div>
      ) : (
        <>
          {/* Key Summary Cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <MetricCard
              title="Placement Rate"
              value={`${report.placementRate || 0}%`}
              icon={IconAward}
              color="primary"
            />
            <MetricCard
              title="Average Package"
              value={`${report.averagePackage || 0} LPA`}
              icon={IconBarChart}
              color="success"
            />
            <MetricCard
              title="Highest Package"
              value={`${report.highestPackage || 0} LPA`}
              icon={IconBarChart}
              color="warning"
            />
            <MetricCard
              title="Total Placed"
              value={`${report.placedStudents || 0} / ${report.totalStudents || 0}`}
              icon={IconUsers}
              color="info"
            />
          </div>

          {/* Department Breakdown Table */}
          <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Department Placement Breakdown</h3>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Batch Year 2024-2025</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th>Total Registered</th>
                    <th>Placed Candidates</th>
                    <th>Unplaced</th>
                    <th>Placement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report.departmentStats?.map((dept, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{dept.department}</td>
                      <td>
                        <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                          {dept.code}
                        </span>
                      </td>
                      <td>{dept.totalStudents}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{dept.placedStudents}</td>
                      <td style={{ color: '#ef4444' }}>{dept.totalStudents - dept.placedStudents}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden', minWidth: '80px' }}>
                            <div
                              style={{
                                width: `${dept.placementRate}%`,
                                height: '100%',
                                background: dept.placementRate > 75 ? '#10b981' : dept.placementRate > 50 ? '#3b82f6' : '#f59e0b',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{dept.placementRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Package Distribution Metrics */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Compensation & Offer Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>MEDIAN CTC PACKAGE</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {report.medianPackage || 0} LPA
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL OFFER LETTERS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {report.totalOffers || 0}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>APPROVED RECRUITING COMPANIES</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {report.totalCompanies || 0}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ACTIVE PLACEMENT DRIVES</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {report.totalDrives || 0}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Reports;
