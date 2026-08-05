import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiArrowRight,
  FiCheckCircle, FiShield, FiUsers,
} from 'react-icons/fi';
import { loginUser } from '../../store/slices/authSlice';

const features = [
  { icon: FiCheckCircle, text: 'Track all your applications in one place' },
  { icon: FiShield,      text: 'Verified opportunities from top companies' },
  { icon: FiUsers,       text: 'Join thousands of students' },
];

const Login = () => {
  const dispatch          = useDispatch();
  const navigate          = useNavigate();
  const { loading }       = useSelector((state) => state.auth);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      // Role-based redirect: admin → /admin/dashboard, student → /student/dashboard
      navigate(`/${result.payload.user.role}/dashboard`, { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>

      {/* ── Left decorative panel (visible ≥ 1024 px) ──────────────────────── */}
      <div
        className="auth-left"
        style={{
          flex: 1, display: 'none', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 40%, #4F46E5 100%)',
          padding: '3rem', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: '350px', height: '350px', top: '-80px', right: '-80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', bottom: '80px', left: '-60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', width: '120px', height: '120px', top: '200px', left: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: 'white', maxWidth: '380px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <FiZap size={26} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.375rem', fontWeight: '800', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>OpportunityHub</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '2px', textTransform: 'uppercase' }}>Find your next opportunity</div>
            </div>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2 }}>
            Your Career Starts Here
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            Access verified opportunities and a thriving community of students.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '0.875rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={16} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: login form ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          {/* Mobile logo (hidden on desktop) */}
          <Link
            to="/"
            className="auth-left-hide"
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', textDecoration: 'none' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiZap size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Opportunity<span style={{ color: '#2563EB' }}>Hub</span>
            </span>
          </Link>

          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.375rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sign in to your account
          </h1>
          <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Create one free →</Link>
          </p>

          {/* ── Form ─────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                  placeholder="your@email.com"
                  style={{ paddingLeft: '2.75rem' }}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd((p) => !p)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem', fontSize: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <svg width="18" height="18" viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <><span>Sign In</span> <FiArrowRight /></>
              )}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', marginTop: '1.5rem' }}>
            Protected by industry-grade security · SSL encrypted
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-left      { display: flex !important; }
          .auth-left-hide { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
