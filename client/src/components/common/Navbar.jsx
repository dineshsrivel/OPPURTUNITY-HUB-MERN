import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiBriefcase, FiGrid } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import useOutsideClick from '../../hooks/useOutsideClick';

const Navbar = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useOutsideClick(profileRef, () => setProfileOpen(false));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { to: '/opportunities', label: 'Opportunities' },
  ];

  return (
    <nav style={{
      background:   'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      position:     'sticky',
      top:          0,
      zIndex:       50,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '64px', gap: '2rem' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.3px' }}>
            Opportunity<span style={{ color: '#2563EB' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }} className="hidden md:flex">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', color: '#64748B', fontWeight: '500', fontSize: '0.9375rem', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = '#EFF6FF'; e.target.style.color = '#2563EB'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#64748B'; }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated && user ? (
            <>
              {/* Dashboard link */}
              <Link to={`/${user.role}/dashboard`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: '#EFF6FF', color: '#2563EB', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}
                className="hidden sm:flex">
                <FiGrid size={14} /> Dashboard
              </Link>

              {/* Profile dropdown */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem 0.375rem 0.375rem', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '2rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: '700', fontSize: '0.875rem' }}>{user.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:block">{user.name}</span>
                  <FiChevronDown size={14} style={{ color: '#94A3B8', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', width: '220px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', padding: '0.5rem', zIndex: 100 }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{user.email}</div>
                        <span className={`badge mt-1 ${user.role === 'admin' ? 'badge-red' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>{user.role}</span>
                      </div>
                      {[
                        { to: `/${user.role}/dashboard`, icon: FiGrid,    label: 'Dashboard' },
                        { to: `/${user.role}/profile`,   icon: FiUser,    label: 'Profile' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <item.icon size={15} /> {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', color: '#EF4444', fontSize: '0.875rem', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem', borderTop: '1px solid #F1F5F9', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FiLogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '0.5rem 1.25rem', color: '#374151', fontWeight: '600', fontSize: '0.9375rem', textDecoration: 'none', borderRadius: '0.625rem', transition: 'all 0.2s', border: '1.5px solid #E2E8F0', background: 'white' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9375rem' }}>Get Started</Link>
            </>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileOpen(o => !o)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#374151' }}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: '1px solid #E2E8F0', background: 'white', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            className="md:hidden">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                style={{ padding: '0.75rem', borderRadius: '0.625rem', color: '#374151', fontWeight: '500', textDecoration: 'none', background: '#F8FAFC' }}>{link.label}</Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', borderRadius: '0.625rem', color: '#2563EB', fontWeight: '600', textDecoration: 'none', textAlign: 'center', border: '1.5px solid #BFDBFE', background: '#EFF6FF' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
