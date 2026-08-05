import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiZap, FiHome, FiUser, FiFileText, FiCpu,
  FiBriefcase, FiUsers, FiBarChart2,
  FiShield, FiSettings, FiLogOut, FiX, FiCalendar,
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { setSidebarMobile } from '../../store/slices/uiSlice';

const studentLinks = [
  { to: '/student/dashboard',    icon: FiHome,      label: 'Dashboard' },
  { to: '/student/profile',      icon: FiUser,      label: 'My Profile' },
  { to: '/opportunities',        icon: FiBriefcase, label: 'Opportunities' },
  { to: '/student/applications', icon: FiFileText,  label: 'Tracker' },
  { to: '/student/calendar',     icon: FiCalendar,  label: 'Calendar' },
];

const adminLinks = [
  { to: '/admin/dashboard',      icon: FiBarChart2,  label: 'Dashboard' },
  { to: '/admin/opportunities',  icon: FiBriefcase,  label: 'Opportunities' },
  { to: '/admin/categories',     icon: FiCpu,        label: 'Categories' },
  { to: '/admin/users',          icon: FiUsers,      label: 'Users' },
  { to: '/admin/reports',        icon: FiShield,     label: 'Reports' },
  { to: '/admin/announcements',  icon: FiZap,        label: 'Announcements' },
  { to: '/admin/settings',       icon: FiSettings,   label: 'Settings' },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { sidebarOpen, sidebarMobile } = useSelector(state => state.ui);

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const roleColors = { student: '#2563EB', admin: '#DC2626' };
  const roleColor  = roleColors[user?.role] || '#2563EB';

  const handleLogout = () => {
    dispatch(setSidebarMobile(false));
    dispatch(logout());
    navigate('/login');
  };

  const closeMobile = () => dispatch(setSidebarMobile(false));

  return (
    <>
      {/* ── Desktop Fixed Sidebar ────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '72px',
          minWidth: sidebarOpen ? '260px' : '72px',
          height: '100vh',
          background: 'white',
          borderRight: '1px solid #E2E8F0',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 30,
          transition: 'width 0.3s ease, min-width 0.3s ease',
        }}
        className="hidden lg:flex flex-col overflow-y-auto overflow-x-hidden"
      >
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? '1.25rem 1.25rem 0.75rem' : '1.25rem 0.75rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${roleColor}, #4F46E5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiZap size={18} color="white" />
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  OpportunityHub
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: sidebarOpen ? '0.75rem 1rem' : '0.75rem 0.5rem', padding: sidebarOpen ? '0.875rem' : '0.5rem', background: `linear-gradient(135deg, ${roleColor}10, ${roleColor}05)`, borderRadius: '0.875rem', border: `1px solid ${roleColor}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, #4F46E5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'white', fontWeight: '700', fontSize: '0.875rem' }}>{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: '600', textTransform: 'capitalize', marginTop: '2px' }}>{user?.role}</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '0 0.5rem', flex: 1 }}>
          {sidebarOpen && (
            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94A3B8', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.375rem', marginTop: '0.25rem' }}>
              Navigation
            </div>
          )}
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              title={!sidebarOpen ? link.label : undefined}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: sidebarOpen ? '0.625rem 0.875rem' : '0.625rem 0',
                ...(isActive ? { color: roleColor, background: `${roleColor}10` } : {}),
              })}
            >
              <link.icon size={18} />
              {sidebarOpen && <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom logout */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid #F1F5F9', marginTop: 'auto' }}>
          <button onClick={handleLogout}
            title={!sidebarOpen ? 'Sign Out' : undefined}
            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '0.625rem', width: '100%', padding: sidebarOpen ? '0.625rem 0.875rem' : '0.625rem 0', borderRadius: '0.75rem', color: '#EF4444', background: '#FEF2F2', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}>
            <FiLogOut size={18} /> {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Slide-in Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarMobile && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: '260px',
              height: '100vh',
              background: 'white',
              borderRight: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              left: 0,
              top: 0,
              zIndex: 50,
              overflowY: 'auto',
            }}
            className="lg:hidden shadow-2xl"
          >
            {/* Logo + Mobile Close Button */}
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${roleColor}, #4F46E5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiZap size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>OpportunityHub</div>
                </div>
              </div>
              <button onClick={closeMobile}
                style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#64748B' }}>
                <FiX size={18} />
              </button>
            </div>

            {/* User card */}
            <div style={{ margin: '0.75rem 1rem', padding: '0.875rem', background: `linear-gradient(135deg, ${roleColor}10, ${roleColor}05)`, borderRadius: '0.875rem', border: `1px solid ${roleColor}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, #4F46E5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {user?.avatar
                    ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{user?.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: '600', textTransform: 'capitalize', marginTop: '2px' }}>{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '0 0.75rem', flex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94A3B8', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.375rem', marginTop: '0.25rem' }}>
                Navigation
              </div>
              {links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => isActive ? { color: roleColor, background: `${roleColor}10` } : {}}
                >
                  <link.icon size={17} />
                  <span style={{ fontSize: '0.9rem' }}>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #F1F5F9', marginTop: 'auto' }}>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', color: '#EF4444', background: '#FEF2F2', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}>
                <FiLogOut size={16} /> Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
