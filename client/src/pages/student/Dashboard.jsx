import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiFileText, FiBookmark, FiBriefcase, FiTrendingUp, FiArrowRight, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { timeAgo, capitalize, getStatusClass } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, bg, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <motion.div whileHover={{ y: -3 }} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: link ? 'pointer' : 'default' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '1rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>{value}</div>
      </div>
    </motion.div>
  </Link>
);

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats]   = useState(null);
  const [apps,  setApps]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/applications/my?limit=5'),
        ]);
        setStats(statsRes.data.stats);
        setApps(appsRes.data.applications);
      } catch (_) {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;

  const statCards = [
    { icon: FiBriefcase,  label: 'Total Opportunities', value: stats?.totalOpportunities || 0, color: '#2563EB', bg: '#EFF6FF', link: '/opportunities' },
    { icon: FiBookmark,   label: 'Saved Opportunities', value: stats?.bookmarks || 0,        color: '#D97706', bg: '#FEF3C7', link: '/student/bookmarks' },
    { icon: FiFileText,   label: 'Applied Opportunities',value: stats?.totalApplications || 0, color: '#059669', bg: '#D1FAE5', link: '/student/applications' },
    { icon: FiClock,      label: 'Deadlines This Week', value: stats?.deadlinesThisWeek || 0,  color: '#EF4444', bg: '#FEE2E2', link: '/student/calendar' },
  ];

  return (
    <div className="page-enter">
      {/* Welcome header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Here's what's happening with your career journey.</p>
        </div>
        <Link to="/opportunities" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          <FiBriefcase size={15} /> Browse Opportunities <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Profile completion banner */}
      {(stats?.profileCompletion ?? 0) < 80 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)', border: '1px solid #BFDBFE', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '0.875rem', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📋</div>
            <div>
              <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Complete your profile — {stats?.profileCompletion}% done</div>
              <div style={{ color: '#64748B', fontSize: '0.8125rem' }}>A complete profile gets 4× more recruiter attention</div>
            </div>
          </div>
          <Link to="/student/profile" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', flexShrink: 0 }}>Complete Profile</Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="premium-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Recent Applications</h2>
          <Link to="/student/applications" style={{ color: '#2563EB', fontSize: '0.8125rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View all <FiArrowRight size={12} /></Link>
        </div>

        {apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#94A3B8' }}>
            <FiFileText size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No applications yet</p>
            <Link to="/opportunities" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Browse Jobs</Link>
          </div>
        ) : apps.map((app) => (
          <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 0', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #DBEAFE' }}>
              {app.opportunity?.companyLogo
                ? <img src={app.opportunity.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontWeight: '700', fontSize: '1rem', color: '#2563EB' }}>{app.opportunity?.companyName?.[0]}</span>}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.opportunity?.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{app.opportunity?.companyName} · {timeAgo(app.appliedAt)}</div>
            </div>
            <span className={`badge ${getStatusClass(app.status)}`} style={{ flexShrink: 0, textTransform: 'capitalize' }}>{capitalize(app.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
