import PropTypes from 'prop-types';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export default function Navbar({ onCartOpen, currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentTab('home');
  };

  return (
    <nav className="navbar">
      <button type="button" className="nav-brand" onClick={handleLogoClick}>
        <ShoppingBag className="icon-cyan" size={24} style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }} />
        Shop<span>EZ</span>
      </button>

      <div className="nav-links">
        <button
          type="button"
          className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentTab('home')}
        >
          Catalog
        </button>

        {user?.role === 'seller' && (
          <button
            type="button"
            className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
            style={{ color: 'var(--color-secondary)', filter: currentTab === 'dashboard' ? 'drop-shadow(0 0 4px var(--color-secondary))' : 'none' }}
          >
            <LayoutDashboard size={16} />
            Seller Hub
          </button>
        )}

        {(!user || user.role === 'customer') && (
          <button className="cart-icon-btn" onClick={onCartOpen} title="Open Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}

        <div className="nav-user">
          {user ? (
            <>
              <div className="nav-username" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} className="icon-cyan" />
                <span>{user.name}</span>
                <span className="badge-purple" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                  {user.role}
                </span>
              </div>
              <button type="button" className="nav-link" onClick={() => { logout(); setCurrentTab('home'); }} title="Sign Out">
                <LogOut size={18} className="icon-red" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`nav-link ${currentTab === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentTab('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`nav-link ${currentTab === 'register' ? 'active' : ''}`}
                onClick={() => setCurrentTab('register')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  onCartOpen: PropTypes.func.isRequired,
  currentTab: PropTypes.string.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};
