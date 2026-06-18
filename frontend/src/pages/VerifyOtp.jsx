import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';

export default function VerifyOtp({ setCurrentTab, email, navigate }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOtp, API_URL } = useAuth();
  const otpInputIds = ['otp-0', 'otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5'];

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (Number.isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        newOtp[index - 1] = '';
      } else {
        newOtp[index] = '';
      }
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length !== 6 || Number.isNaN(Number(pastedData))) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please provide the full 6-digit confirmation code.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const res = await verifyOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      setSuccess('Account verified successfully!');
      setTimeout(() => {
        if (navigate) {
          navigate('create-profile', 'Loading profile details...');
        } else {
          setCurrentTab('create-profile');
        }
      }, 1200);
    } else {
      setError(res.message || 'OTP verification failed.');
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('A new verification code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact transmission servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        
        {/* Envelope checkmark icon */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#f5f3ff', position: 'relative', marginBottom: '1.5rem' }}>
          <Mail size={42} style={{ color: 'var(--color-primary)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '2px solid white' }}>
            ✓
          </div>
        </div>

        <div className="auth-header">
          <h2>Verify Your Email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', padding: '0 10px' }}>
            We have sent a verification code to <strong>{email}</strong>. Please check your inbox to verify your account.
          </p>
        </div>

        {error && (
          <div className="auth-msg auth-msg-error">
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-msg auth-msg-success">
            <CheckCircle size={16} style={{ marginRight: '8px' }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* OTP boxes */}
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={otpInputIds[index]}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                className="otp-box-input"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={loading}
                autoComplete="off"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn-purple" 
            style={{ width: '100%', padding: '12px', marginBottom: '15px' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Didn't receive the email? </span>
          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={handleResend}>
            Resend
          </button>
        </div>

        {/* Sandbox Note */}
        <div style={{ background: 'var(--bg-body)', borderRadius: '8px', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px', border: '1px dashed var(--border-color)', textAlign: 'left' }}>
          <strong>💡 Dev Sandbox Note:</strong> Check the terminal console logs of your running node server to view the generated OTP code.
        </div>
      </div>
    </div>
  );
}

VerifyOtp.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  navigate: PropTypes.func,
};
