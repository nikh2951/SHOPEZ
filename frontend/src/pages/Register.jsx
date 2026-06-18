import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { User, Mail, KeyRound, AlertTriangle, ShoppingBag } from 'lucide-react';

export default function Register({ setCurrentTab, setOtpEmail }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [role, setRole] = useState('customer'); // customer or seller
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please provide all details to sign up.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    setError('');
    setLoading(true);
    
    const res = await register(name, email, password, role);
    setLoading(false);

    if (res.success) {
      setOtpEmail(res.email);
      setCurrentTab('verify-otp');
    } else {
      setError(res.message || 'Registration failed.');
    }
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
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign up to get started</p>
        </div>

        {error && (
          <div className="auth-msg auth-msg-error">
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="register-name" className="neon-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="register-name"
                type="text" 
                className="neon-input" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="register-email" className="neon-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-light)' }} />
              <input 
                id="register-email"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label htmlFor="register-password" className="neon-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '15px', color: 'var(--text-light)' }} />
                <input 
                  id="register-password"
                  type="password" 
                  className="neon-input" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="neon-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '15px', color: 'var(--text-light)' }} />
                <input 
                  id="register-confirm"
                  type="password" 
                  className="neon-input" 
                  placeholder="Confirm" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Role Selector */}
          <div style={{ marginBottom: '15px' }}>
            <label className="neon-label">Account Role</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn-secondary ${role === 'customer' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderColor: role === 'customer' ? 'var(--color-primary)' : 'var(--border-color)', backgroundColor: role === 'customer' ? 'var(--color-primary-light)' : 'white', color: role === 'customer' ? 'var(--color-primary)' : 'var(--text-main)' }}
                onClick={() => setRole('customer')}
              >
                Customer
              </button>
              <button
                type="button"
                className={`btn-secondary ${role === 'seller' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderColor: role === 'seller' ? 'var(--color-primary)' : 'var(--border-color)', backgroundColor: role === 'seller' ? 'var(--color-primary-light)' : 'white', color: role === 'seller' ? 'var(--color-primary)' : 'var(--text-main)' }}
                onClick={() => setRole('seller')}
              >
                Seller (Merchant)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input 
              id="agree-terms"
              type="checkbox" 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="agree-terms" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms & Conditions (Simulated)'); }} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Terms & Conditions</a>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-purple" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setCurrentTab('login')}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

Register.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  setOtpEmail: PropTypes.func.isRequired,
};
