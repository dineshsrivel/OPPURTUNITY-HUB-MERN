import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { toggleSidebar, toggleSidebarMobile } from '../../store/slices/uiSlice';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import { timeAgo }                from '../../utils/helpers';
import useOutsideClick            from '../../hooks/useOutsideClick';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { sidebarMobile } = useSelector(state => state.ui);
  const { list: notifications, unreadCount } = useSelector(state => state.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebarMobile());
    } else {
      dispatch(toggleSidebar());
    }
  };

  return (
    <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
      <button onClick={handleToggle}
        aria-label="Toggle sidebar"
        style={{ padding: '0.5rem', borderRadius: '0.625rem', border: 'none', background: '#F1F5F9', cursor: 'pointer', color: '#374151', display: 'flex' }}>
        <FiMenu size={18} />
      </button>

      <div style={{ flex: 1 }} />

      {/* Notification bell */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button onClick={() => setNotifOpen(o => !o)}
          style={{ position: 'relative', padding: '0.5rem', borderRadius: '0.625rem', border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', color: '#374151' }}>
          <FiBell size={18} className={unreadCount > 0 ? 'bell-ring' : ''} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', fontSize: '0.625rem', fontWeight: '700', borderRadius: '9999px', padding: '0 4px', minWidth: '16px', textAlign: 'center', lineHeight: '16px' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
              style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', width: '340px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A' }}>Notifications {unreadCount > 0 && <span style={{ color: '#2563EB' }}>({unreadCount})</span>}</span>
                {unreadCount > 0 && (
                  <button onClick={() => dispatch(markAllNotificationsRead())}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563EB', fontSize: '0.75rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FiCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto' }} className="scrollbar-thin">
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    <FiBell size={28} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications yet</p>
                  </div>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n._id} onClick={() => dispatch(markNotificationRead(n._id))}
                    style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F8FAFC', background: n.isRead ? 'transparent' : '#F0F9FF', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : '#F0F9FF'}>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? '#CBD5E1' : '#2563EB', marginTop: '6px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.8125rem', color: '#0F172A', marginBottom: '2px' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>{n.message}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '4px' }}>{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem 0.375rem 0.5rem', background: '#F8FAFC', borderRadius: '2rem', border: '1px solid #E2E8F0' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: '700', fontSize: '0.75rem' }}>{user?.name?.[0]?.toUpperCase()}</span>}
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0F172A' }} className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
