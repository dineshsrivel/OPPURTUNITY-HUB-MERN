import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiArrowRight, FiTrendingUp, FiBriefcase, FiBookOpen, FiCpu, FiUsers, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';

// Static hero stats — aspirational marketing copy
const heroStats = [
  { value: '50K+', label: 'Students' },
  { value: '15K+', label: 'Opportunities' },
  { value: '92%', label: 'Placement Rate' },
];

const CATEGORIES = [
  { icon: FiBriefcase,    label: 'Jobs',         slug: 'jobs',         color: '#2563EB', bg: '#EFF6FF' },
  { icon: FiTrendingUp,   label: 'Internships',  slug: 'internships',  color: '#7C3AED', bg: '#F5F3FF' },
  { icon: FiUsers,        label: 'Freelancing',  slug: 'freelancing',  color: '#0EA5E9', bg: '#EFF6FF' },
  { icon: FiCpu,          label: 'Hackathons',   slug: 'hackathons',   color: '#D97706', bg: '#FEF3C7' },
  { icon: FiBookOpen,     label: 'Scholarships', slug: 'scholarships', color: '#059669', bg: '#D1FAE5' },
];

const features = [
  {
    icon: FiCheckCircle,
    title: 'Verified Opportunities',
    desc: 'Every company and listing is manually verified by our admin team. No spam, no fake jobs.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: FiUsers,
    title: 'Mentorship Network',
    desc: 'Connect with expert mentors and receive guidance on applications, interviews, and career growth.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
];

const LandingPage = () => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalFeatured, setTotalFeatured] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch all opportunities count grouped by category in a single call
        const res = await api.get('/opportunities?limit=1');
        const total = res.data.total || 0;

        // Fetch per-category counts in parallel
        const counts = await Promise.all(
          CATEGORIES.map(async (cat) => {
            try {
              const r = await api.get(`/opportunities?category=${cat.label}&limit=1`);
              return { label: cat.label, count: r.data.total || 0 };
            } catch (_) { return { label: cat.label, count: 0 }; }
          })
        );

        const countMap = {};
        counts.forEach(({ label, count }) => { countMap[label] = count; });
        setCategoryCounts(countMap);

        // Featured count
        const featuredRes = await api.get('/opportunities?isFeatured=true&limit=1');
        setTotalFeatured(featuredRes.data.total || 0);
      } catch (_) {
        // If API fails, gracefully show 0
        setCategoryCounts({});
        setTotalFeatured(0);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 50%, #F8FAFC 100%)', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-120px', right: '-120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', bottom: '-80px', left: '-80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.1), transparent)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'white', border: '1.5px solid #BFDBFE', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: '600', color: '#2563EB', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>
              <FiZap size={13} />
              Introducing OpportunityHub
            </div>

            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: '900', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '1.25rem', lineHeight: 1.15, letterSpacing: '-1px' }}>
              Land Your{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Dream Career
              </span>
              <br />Today
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
              Discover verified jobs, internships, freelancing, hackathons, and scholarships. Find your path and join a thriving student community.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Get Started Free <FiArrowRight size={17} />
              </Link>
              <Link to="/opportunities" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Browse Opportunities
              </Link>
            </div>
          </motion.div>

          {/* Hero stats — static marketing copy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ display: 'flex', gap: '0', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
            {heroStats.map((s, i) => (
              <div key={s.label} style={{ padding: '1.5rem 2.5rem', textAlign: 'center', borderRight: i < heroStats.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '2px' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories Section with LIVE counts ──────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '0.5rem' }}>Explore Opportunities</h2>
            <p style={{ color: '#64748B', fontSize: '1rem' }}>From entry-level to leadership — find what's right for you</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            {CATEGORIES.map((cat, i) => {
              const count = categoryCounts[cat.label] ?? 0;
              return (
                <motion.div key={cat.label} whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/opportunities/${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="premium-card" style={{ padding: '1.75rem', cursor: 'pointer' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '1rem', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <cat.icon size={24} color={cat.color} />
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '1.0625rem', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '4px' }}>{cat.label}</div>
                      {loadingCounts ? (
                        <div style={{ height: '14px', width: '60px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      ) : (
                        <div style={{ fontSize: '0.8125rem', color: count === 0 ? '#94A3B8' : cat.color, fontWeight: '600' }}>
                          {count === 0 ? 'None yet' : `${count} available`}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Opportunities CTA ────────────────────────────────────────── */}
      <section style={{ padding: '4rem 1.5rem', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '0.5rem' }}>Live Opportunities</h2>
            {loadingCounts ? (
              <p style={{ color: '#64748B', fontSize: '1rem' }}>Loading live listings...</p>
            ) : totalFeatured > 0 ? (
              <p style={{ color: '#64748B', fontSize: '1rem' }}>Students can browse <strong style={{ color: '#2563EB' }}>{totalFeatured} featured listings</strong> right now.</p>
            ) : (
              <p style={{ color: '#64748B', fontSize: '1rem' }}>No opportunities published yet. Check back soon!</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/opportunities" className="btn-primary" style={{ padding: '0.875rem 1.75rem' }}>Explore All Listings</Link>
          </div>
        </div>
      </section>

      {/* ── Why OpportunityHub ────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '0.5rem' }}>Why OpportunityHub?</h2>
            <p style={{ color: '#64748B', fontSize: '1rem' }}>Built for students, trusted by universities</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {features.map((f) => (
              <motion.div key={f.title} className="premium-card" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #1D4ED8, #2563EB, #4F46E5)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '1rem', lineHeight: 1.2 }}>
            Ready to launch your career?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join 50,000+ students who found their dream opportunity through OpportunityHub.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'white', color: '#2563EB', borderRadius: '0.875rem', fontWeight: '700', fontSize: '1rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
              Start for Free <FiArrowRight size={17} />
            </Link>
            <Link to="/opportunities" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '0.875rem', fontWeight: '600', fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)' }}>
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <FiZap size={16} color="#2563EB" />
          <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9375rem' }}>OpportunityHub</span>
        </div>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>© {new Date().getFullYear()} OpportunityHub. Built with ⚡ for students everywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
