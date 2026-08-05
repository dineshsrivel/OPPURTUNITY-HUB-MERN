import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiZap, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [sentTo,  setSentTo]  = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSentTo(email);
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 60%, #F8FAFC 100%)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Opportunity<span style={{ color: '#2563EB' }}>Hub</span>
            <span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: '600', marginLeft: '4px' }}>2.0</span>
          </span>
        </Link>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.25rem', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          {!sent ? (
            <>
              <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid #BFDBFE' }}>
                <FiMail size={26} color="#2563EB" />
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Forgot your password?
              </h1>
              <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                No worries! Enter your email address and we'll send you a secure reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <FiMail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="your@email.com" style={{ paddingLeft: '2.75rem' }}
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                  </div>
                  {errors.email && <div className="form-error">{errors.email.message}</div>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <svg width="16" height="16" viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="5" strokeDasharray="90 150" />
                      </svg>
                      Sending...
                    </span>
                  ) : <><FiSend size={16} /> Send Reset Link</>}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <FiCheckCircle size={36} color="#059669" />
              </div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Check your inbox!</h2>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                We've sent a password reset link to <strong style={{ color: '#0F172A' }}>{sentTo}</strong>.
                Check your inbox (and spam folder).
              </p>
              <button onClick={() => setSent(false)} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginBottom: '0.75rem' }}>
                Try a different email
              </button>
            </motion.div>
          )}

          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', color: '#64748B', fontSize: '0.875rem', textDecoration: 'none', justifyContent: 'center', fontWeight: '500' }}>
            <FiArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
