const LoadingSpinner = ({ size = 'md', color = '#2563EB', text = '' }) => {
  const sizes = { sm: 20, md: 32, lg: 48, xl: 64 };
  const px    = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <svg width={px} height={px} viewBox="0 0 50 50" style={{ animation: 'spin 0.9s linear infinite' }}>
        <defs>
          <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="20" fill="none" stroke="url(#spinnerGrad)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray="90 150" strokeDashoffset="0" />
      </svg>
      {text && <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;
