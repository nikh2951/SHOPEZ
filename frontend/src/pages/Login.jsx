import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Mail, KeyRound, AlertTriangle, ShoppingBag } from 'lucide-react';

export default function Login({ setCurrentTab, setOtpEmail, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Google OAuth & Mock Google States
  const [clientId, setClientId] = useState('');
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [mockEmail, setMockEmail] = useState('john.doe@gmail.com');

  const { login, loginWithGoogle, API_URL } = useAuth();

  useEffect(() => {
    // Fetch google client id from backend
    const getGoogleConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/google/client-id`);
        const data = await res.json();
        if (data.success && data.clientId) {
          setClientId(data.clientId);
          
          // Wait briefly for the GIS script to load if it hasn't already
          const checkGoogleScript = setInterval(() => {
            if (window.google) {
              clearInterval(checkGoogleScript);
              try {
                window.google.accounts.id.initialize({
                  client_id: data.clientId,
                  callback: handleGoogleCallback,
                });
                window.google.accounts.id.renderButton(
                  document.getElementById('google-btn-container'),
                  { theme: 'outline', size: 'large', width: '380' }
                );
              } catch (err) {
                console.error('Error rendering Google button:', err);
              }
            }
          }, 300);
          
          // Clear interval after 10s to avoid leak
          setTimeout(() => clearInterval(checkGoogleScript), 10000);
        }
      } catch (err) {
        console.error('Failed to load Google client ID configuration:', err);
      }
    };

    getGoogleConfig();
  }, [API_URL]);

  const handleGoogleCallback = async (response) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');
    const res = await loginWithGoogle(response.credential);
    setLoading(false);
    if (res.success) {
      if (navigate) {
        navigate(res.user?.role === 'seller' ? 'dashboard' : 'home', 'Logged in via Google!');
      } else {
        setCurrentTab(res.user?.role === 'seller' ? 'dashboard' : 'home');
      }
    } else {
      setError(res.message || 'Google authentication failed.');
    }
  };

  const handleMockGoogleLogin = async () => {
    setShowMockGoogle(false);
    if (!mockEmail) {
      setError('Please provide an email for mock login.');
      return;
    }
    setLoading(true);
    setError('');
    const mockToken = `mock-google-token-${mockEmail}`;
    const res = await loginWithGoogle(mockToken);
    setLoading(false);
    if (res.success) {
      if (navigate) {
        navigate(res.user?.role === 'seller' ? 'dashboard' : 'home', 'Welcome to ShopEZ (Demo Mode)!');
      } else {
        setCurrentTab(res.user?.role === 'seller' ? 'dashboard' : 'home');
      }
    } else {
      setError(res.message || 'Mock Google login failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (navigate) {
        navigate(res.user?.role === 'seller' ? 'dashboard' : 'home', 'Welcome back!');
      } else {
        setCurrentTab(res.user?.role === 'seller' ? 'dashboard' : 'home');
      }
      return;
    }

    if (res.requiresVerification) {
      setOtpEmail(res.email);
      if (navigate) navigate('verify-otp', 'Confirm your email address');
      else setCurrentTab('verify-otp');
      return;
    }

    setError(res.message || 'Invalid email or password.');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="auth-logo">
            <ShoppingBag size={28} style={{ color: 'var(--color-primary)' }} />
            <span>ShopEase</span>
          </div>
        </div>

        <div className="auth-header">
          <h2>Welcome Back!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Login to your account</p>
        </div>

        {error && (
          <div className="auth-msg auth-msg-error">
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="login-email" className="neon-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="login-email"
                type="email" 
                className="neon-input" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="login-password" className="neon-label" style={{ margin: 0 }}>Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent (simulated).'); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="login-password"
                type="password" 
                className="neon-input" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
            <input 
              id="remember-me"
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Remember me</label>
          </div>

          <button 
            type="submit" 
            className="btn-purple" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '0.8rem', color: 'var(--text-light)', position: 'relative' }}>
          <span style={{ background: 'white', padding: '0 10px', zIndex: 1, position: 'relative' }}>or continue with</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border-color)', zIndex: 0 }}></div>
        </div>

        {/* Social Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {clientId ? (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0.5rem 0' }}>
              <div id="google-btn-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowMockGoogle(true)} className="social-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google (Demo Mode)
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setCurrentTab('register')}>
            Sign up
          </button>
        </div>
      </div>

      {/* Interactive Mock Google OAuth Dialog */}
      {showMockGoogle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="auth-container" style={{ position: 'relative', maxWidth: '420px', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="auth-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google Sign-In</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>Choose an account</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to continue to ShopEZ</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Alex Smith', email: 'alex.smith@gmail.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
                { name: 'Julia Roberts', email: 'julia.roberts@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
                { name: 'Demo Developer', email: 'developer@shopease.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }
              ].map(opt => (
                <button
                  key={opt.email}
                  type="button"
                  onClick={() => { setMockEmail(opt.email); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: mockEmail === opt.email ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: mockEmail === opt.email ? 'var(--color-primary-light)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={opt.avatar} alt={opt.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{opt.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label htmlFor="custom-mock-email" className="neon-label" style={{ fontSize: '0.8rem' }}>Or use a custom email</label>
              <input
                id="custom-mock-email"
                type="email"
                className="neon-input"
                placeholder="name@example.com"
                value={mockEmail}
                onChange={(e) => setMockEmail(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                onClick={() => setShowMockGoogle(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-purple"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                onClick={handleMockGoogleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Login.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  setOtpEmail: PropTypes.func.isRequired,
  navigate: PropTypes.func,
};
