import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiZap, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setMessage(data.message);
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 60%, #F8FAFC 100%)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Opportunity<span style={{ color: '#2563EB' }}>Hub</span>
            <span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: '600', marginLeft: '4px' }}>2.0</span>
          </span>
        </Link>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          {status === 'loading' && (
            <div style={{ padding: '1rem 0' }}>
              <LoadingSpinner size="lg" text="Verifying your email..." />
            </div>
          )}

          {status === 'success' && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #D1FAE5, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 0 8px rgba(16,185,129,0.08)' }}>
                <FiCheckCircle size={40} color="#059669" />
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.625rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Email Verified! 🎉</h1>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem' }}>{message}</p>
              <Link to="/login" className="btn-primary" style={{ justifyContent: 'center', padding: '0.9375rem', fontSize: '1rem', display: 'flex' }}>
                Sign In to Your Account <FiArrowRight />
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <FiXCircle size={40} color="#DC2626" />
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.625rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Verification Failed</h1>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem' }}>{message}</p>
              <Link to="/register" className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem', display: 'flex', marginBottom: '0.75rem' }}>
                Register Again
              </Link>
              <Link to="/login" style={{ display: 'block', color: '#64748B', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center', fontWeight: '500' }}>
                Already verified? Sign In →
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
