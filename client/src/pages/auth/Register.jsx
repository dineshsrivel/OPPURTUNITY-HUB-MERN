import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiArrowRight, FiCheck } from 'react-icons/fi';
import { registerUser } from '../../store/slices/authSlice';



const passwordRules = (val) => {
  return val.length >= 8 || 'Password must be at least 8 characters';
};

const Register = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(state => state.auth);
  const [showPwd,  setShowPwd]  = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'student' } });
  const pwd = watch('password', '');

  const pwdStrength = [
    { label: '8+ chars',  met: pwd.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(pwd) },
    { label: 'Number',    met: /\d/.test(pwd) },
  ];

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser({ ...data, role: 'student' }));
    if (registerUser.fulfilled.match(result)) {
      navigate(`/student/dashboard`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 50%, #F8FAFC 100%)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Opportunity<span style={{ color: '#2563EB' }}>Hub</span>

          </span>
        </Link>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.25rem', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.375rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Create your account
          </h1>
          <p style={{ color: '#64748B', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Sign in →</Link>
          </p>



          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Arjun Sharma" style={{ paddingLeft: '2.75rem' }}
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
              </div>
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="your@email.com" style={{ paddingLeft: '2.75rem' }}
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } })} />
              </div>
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={showPwd ? 'text' : 'password'} className={`form-input ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 8 characters" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  {...register('password', { required: 'Password is required', validate: passwordRules })} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password.message}</div>}

              {/* Password strength indicators */}
              {pwd && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {pwdStrength.map(rule => (
                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: rule.met ? '#10B981' : '#94A3B8', fontWeight: '500' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: rule.met ? '#10B981' : '#CBD5E1' }} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem', fontSize: '1rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <svg width="18" height="18" viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" />
                  </svg>
                  Creating account...
                </span>
              ) : <><span>Create Account</span> <FiArrowRight /></>}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', marginTop: '1.25rem', lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;
