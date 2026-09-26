import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconBriefcase,
  IconUsers,
  IconBuilding,
  IconAward,
  IconShield,
  IconCheckCircle,
  IconTrendingUp,
  IconBarChart,
  IconMessageSquare,
  IconMegaphone,
} from '../components/Icons';

const Landing = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin-dashboard';
      case 'PLACEMENT_OFFICER':
        return '/officer-dashboard';
      case 'COMPANY':
        return '/company-dashboard';
      case 'STUDENT':
      default:
        return '/student-dashboard';
    }
  };

  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'How does the Automatic Eligibility Engine work?',
      a: 'When a company publishes a placement drive with criteria (e.g. minimum CGPA, 10th/12th percentages, active backlog thresholds, eligible branches), the engine instantaneously filters all registered student profiles. Only students matching 100% of the criteria receive drive alerts and can submit an application.',
    },
    {
      q: 'How are multi-stage interview rounds managed?',
      a: 'Recruiters and Placement Officers can schedule sequential rounds (Aptitude, Coding, Technical, HR) with custom dates, timings, and meeting links. Real-time updates notify students and synchronize with the authoritative selection dashboard.',
    },
    {
      q: 'Can recruiters directly view student resumes and profiles?',
      a: 'Yes! Approved company recruiters can browse verified candidate profiles, inspect verified CGPAs and skill sets, and preview or download uploaded PDF resumes directly from their recruitment pipeline.',
    },
    {
      q: 'Can placement officers export accreditation and audit reports?',
      a: 'Placement Officers and Super Admins can export departmental placement statistics, salary percentiles, and placed candidate rosters directly to CSV with one click for NAAC/NIRF reporting.',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.94) 60%, #0f172a 100%), url("/images/placement-bg.jpg") center top/cover fixed no-repeat',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation Bar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: '0 0 15px rgba(79, 70, 229, 0.4)',
            }}
          >
            CP
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              SmartPlacement
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campus ERP Suite
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#features" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
            Features
          </a>
          <a href="#how-it-works" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
            How It Works
          </a>
          <a href="#stats" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
            Statistics
          </a>
          <a href="#faq" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
            FAQ
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#ffffff',
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: '#ffffff',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '999px',
            padding: '6px 16px',
            fontSize: '13px',
            color: '#818cf8',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          Enterprise College Placement & Recruitment Platform
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '960px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Smart College Placement Management System
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Streamline student placements, recruitment drives, applications, interviews, and placement analytics in one intelligent, unified platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              color: '#ffffff',
              padding: '0.85rem 2rem',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Get Started <span style={{ fontSize: '18px' }}>→</span>
          </Link>
          <Link
            to="/login"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '0.85rem 2rem',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            Explore Placements
          </Link>
        </div>

        {/* Demo Credentials Pill Bar */}
        <div
          style={{
            marginTop: '3.5rem',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'left',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Instant Demo Credentials (1-Click Ready)
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Password for all demo accounts: <code style={{ color: '#f1f5f9', background: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>Password123 / Role@123</code></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>SUPER ADMIN</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>admin@smartplacement.com</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pass: Admin@123</div>
            </div>

            <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700 }}>PLACEMENT OFFICER</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>officer@smartplacement.com</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pass: Officer@123</div>
            </div>

            <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>STUDENT CANDIDATE</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>arjun@student.com</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pass: Student@123</div>
            </div>

            <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>COMPANY RECRUITER</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>hr@techcorp.com</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pass: Company@123</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" style={{ padding: '3rem 2rem', background: '#090d16', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#38bdf8' }}>94.2%</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Batch Placement Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#818cf8' }}>14.5 LPA</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Average CTC Package</div>
          </div>
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#34d399' }}>45.0 LPA</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Highest Offered Package</div>
          </div>
          <div>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#f472b6' }}>120+</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Recruiting Companies</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }}>Comprehensive Placement Engine</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Built specifically to eliminate spreadsheets, manual verifications, and fragmented communications.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '1.25rem' }}>
              <IconAward size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Automatic Eligibility Engine
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Instant computational evaluation of CGPA, 10th/12th percentages, department, graduation batch, and active backlogs to identify and alert eligible students.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.25rem' }}>
              <IconBriefcase size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              End-to-End Drive Lifecycle
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Post job profiles, specify package details, set application deadlines, and monitor the candidate pipeline from initial application to final offer issuance.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <IconBarChart size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Real-time Analytics & Reports
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Inspect live placement rates by department, salary distributions, top hiring partners, and export comprehensive CSV records for accreditation.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.25rem' }}>
              <IconMessageSquare size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Secure Internal Messaging
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Direct in-platform communication between students, placement coordinators, and recruiters with automatic audit trails and role isolation.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', marginBottom: '1.25rem' }}>
              <IconMegaphone size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Targeted Notice Board
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Broadcast priority placement alerts to specific graduating batches, departments, or all students with in-app bell notification delivery.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '1.25rem' }}>
              <IconShield size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Audit Logs & Governance
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
              Complete transparency with enterprise audit logs capturing user authentications, application shortlists, interview outcomes, and administrative actions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', background: '#090d16', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Unified End-to-End Recruitment Workflow
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3.5rem' }}>
            How SmartPlacement orchestrates students, recruiters, and placement officers seamlessly:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #4f46e5' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#818cf8', marginBottom: '8px' }}>01</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>Drive Creation</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Recruiter publishes job criteria; Placement Officer verifies and activates the drive for campus viewing.
              </p>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>02</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>Eligibility Check</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Engine evaluates academic scores, branches, and backlogs to qualify candidates and dispatches alerts.
              </p>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399', marginBottom: '8px' }}>03</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>1-Click Apply</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Eligible students submit applications with their verified academic profile and digital resume snapshot.
              </p>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fbbf24', marginBottom: '8px' }}>04</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>Interview & Offer</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Rounds are scheduled, feedback is logged, and selections instantly transition candidate status to Placed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '5rem 2rem', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem' }}>
            Everything you need to know about the placement portal.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              style={{
                background: '#1e293b',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>{faq.q}</span>
                <span style={{ fontSize: '20px', color: '#818cf8', fontWeight: 700 }}>
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </div>
              {activeFaq === idx && (
                <p style={{ marginTop: '0.75rem', fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.1))', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Ready to Elevate Your Campus Placement Drive?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Join top universities, placement cells, and multinational recruiters on the modern placement ERP.
        </p>
        <Link
          to="/register"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
            color: '#ffffff',
            padding: '0.85rem 2.2rem',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
          }}
        >
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2.5rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#090d16', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © 2025 Smart College Placement Management System. Full-Stack MERN Architecture.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Portal Login</Link>
            <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>Register</Link>
            <a href="#stats" style={{ color: '#94a3b8', textDecoration: 'none' }}>Placement Stats</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
