import PropTypes from 'prop-types';
import { useAuth } from '../context/useAuth';
import { Check } from 'lucide-react';

export default function ProfileSuccess({ setCurrentTab, navigate }) {
  const { user } = useAuth();
  
  const handleProceed = () => {
    if (navigate) {
      navigate(user?.role === 'seller' ? 'dashboard' : 'home', 'Opening dashboard...');
    } else {
      setCurrentTab(user?.role === 'seller' ? 'dashboard' : 'home');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Confetti simulation elements (CSS details in index.css) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.8 }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></div>
          <div style={{ position: 'absolute', top: '25%', right: '20%', width: '8px', height: '4px', background: '#3b82f6', transform: 'rotate(45deg)' }}></div>
          <div style={{ position: 'absolute', top: '40%', left: '30%', width: '5px', height: '10px', background: '#eab308', transform: 'rotate(-15deg)' }}></div>
          <div style={{ position: 'absolute', top: '65%', left: '10%', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
          <div style={{ position: 'absolute', top: '80%', right: '15%', width: '6px', height: '6px', background: '#a855f7' }}></div>
          <div style={{ position: 'absolute', top: '50%', right: '35%', width: '10px', height: '3px', background: '#f97316', transform: 'rotate(120deg)' }}></div>
        </div>

        <div className="success-circle-icon">
          <Check size={40} strokeWidth={3} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Profile Created Successfully!</h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          Welcome to ShopEase, {user?.name || 'User'} 👋
          <br /><br />
          You can now explore millions of products and enjoy shopping.
        </p>

        <button 
          onClick={handleProceed} 
          className="btn-purple" 
          style={{ width: '100%', padding: '12px' }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

ProfileSuccess.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  navigate: PropTypes.func,
};
