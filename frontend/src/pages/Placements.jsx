import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import { IconAward, IconTrendingUp, IconUsers } from '../components/Icons';
import api from '../services/api';

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/placements');
        if (res.success && res.data) {
          setPlacements(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlacements();
  }, []);

  const totalOffers = placements.length;
  const packages = placements.map(p => p.package || p.ctc || 0).filter(Boolean);
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  const avgPackage = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1) : 0;

  return (
    <Layout pageTitle="Placed Students Hall of Fame">
      <div className="grid-responsive" style={{ marginBottom: '28px' }}>
        <MetricCard
          title="Total Offers Extended"
          value={totalOffers}
          icon={<IconAward size={22} />}
          color="#10b981"
          subtext="Confirmed campus placements"
        />
        <MetricCard
          title="Highest CTC Package"
          value={`₹${highestPackage} LPA`}
          icon={<IconTrendingUp size={22} />}
          color="#4f46e5"
          subtext="Record campus compensation"
        />
        <MetricCard
          title="Average CTC Package"
          value={`₹${avgPackage} LPA`}
          icon={<IconUsers size={22} />}
          color="#06b6d4"
          subtext="Across all placed engineering batches"
        />
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Placed Students</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Loading placements hall of fame...
          </div>
        ) : placements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
            <IconAward size={42} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>
              No Placements Recorded Yet
            </h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Offers extended through drives will automatically appear in this hall of fame.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Hiring Company</th>
                  <th>Package (CTC)</th>
                  <th>Placement Date</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {p.student?.user?.name || p.student?.name || 'Placed Student'}
                      </div>
                    </td>
                    <td>{p.student?.rollNumber || 'N/A'}</td>
                    <td>
                      <span className="status-pill neutral">
                        {p.student?.department?.code || p.student?.branch || 'CSE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#4f46e5' }}>
                        {p.company?.name || 'Company'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {p.drive?.roleTitle || 'Graduate Trainee'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#065f46', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
                        ₹{p.package || p.ctc || 'N/A'} LPA
                      </span>
                    </td>
                    <td>{new Date(p.createdAt || Date.now()).toLocaleDateString()}</td>
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

export default Placements;
