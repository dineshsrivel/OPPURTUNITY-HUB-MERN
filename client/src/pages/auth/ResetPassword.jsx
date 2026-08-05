import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiZap, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';

const ResetPassword = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const [loading,   setLoading]   = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done,      setDone]      = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const pwd = watch('password', '');

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      // Auto login
      localStorage.setItem('oh2_token', data.token);
      localStorage.setItem('oh2_user',  JSON.stringify(data.user));
      dispatch(setUser(data.user));
      setDone(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate(`/${data.user.role}/dashboard`), 1800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 60%, #F8FAFC 100%)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '420px' }}>

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
          {!done ? (
            <>
              <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid #BFDBFE' }}>
                <FiLock size={26} color="#2563EB" />
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Set new password</h1>
              <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Your new password must be at least 8 characters long.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* New Password */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input type={showPwd ? 'text' : 'password'} className={`form-input ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="Min. 8 characters" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <div className="form-error">{errors.password.message}</div>}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input type={showConfirm ? 'text' : 'password'} className={`form-input ${errors.confirm ? 'border-red-400' : ''}`}
                      placeholder="Re-enter password" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                      {...register('confirm', { required: 'Please confirm your password', validate: v => v === pwd || 'Passwords do not match' })} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.confirm && <div className="form-error">{errors.confirm.message}</div>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <FiCheckCircle size={36} color="#059669" />
              </div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Password Reset!</h2>
              <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Redirecting to your dashboard...</p>
            </motion.div>
          )}

          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', color: '#64748B', fontSize: '0.875rem', textDecoration: 'none', justifyContent: 'center', fontWeight: '500' }}>
            <FiArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
