import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

const Unauthorized = () => {
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);

  const dashboardPath = user ? `/${user.role}/dashboard` : '/login';
  const dashboardLabel = user?.role === 'admin' ? 'Admin Dashboard' : user ? 'My Dashboard' : 'Login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF1F2 0%, #FEF2F2 50%, #F8FAFC 100%)',
        padding: '2rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 16px 40px rgba(239,68,68,0.2)',
            border: '2px solid rgba(239,68,68,0.15)',
          }}
        >
          <FiShield size={46} color="#EF4444" />
        </motion.div>

        {/* Error Code */}
        <div
          style={{
            fontSize: '5rem',
            fontWeight: '900',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          403
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#0F172A',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            marginBottom: '0.875rem',
          }}
        >
          Access Denied
        </h1>

        {/* Description */}
        <p
          style={{
            color: '#64748B',
            fontSize: '1rem',
            lineHeight: 1.75,
            marginBottom: '0.5rem',
          }}
        >
          You don't have permission to access this page.
        </p>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
          This area is restricted to{' '}
          <strong style={{ color: '#EF4444' }}>Administrators</strong> only.
          {user && user.role === 'student' && (
            <> Your account is registered as a <strong style={{ color: '#2563EB' }}>Student</strong>.</>
          )}
        </p>

        {/* Info box */}
        <div
          style={{
            background: '#FFF7F7',
            border: '1px solid #FECACA',
            borderRadius: '1rem',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: '#B91C1C', fontWeight: '600', marginBottom: '0.375rem' }}>
            🔒 Why am I seeing this?
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748B', fontSize: '0.8125rem', lineHeight: 1.8 }}>
            <li>You tried to access an admin-only page</li>
            <li>Your account role does not have admin privileges</li>
            <li>If you believe this is a mistake, contact support</li>
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
          >
            <FiArrowLeft size={16} /> Go Back
          </button>

          <Link
            to={dashboardPath}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', textDecoration: 'none' }}
          >
            <FiHome size={16} /> {dashboardLabel}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
