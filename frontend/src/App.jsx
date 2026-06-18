import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/useCart';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Dashboard from './pages/Dashboard';
import CreateProfile from './pages/CreateProfile';
import ProfileSuccess from './pages/ProfileSuccess';
import ProductListing from './pages/ProductListing';
import UserProfile from './pages/UserProfile';

// Icons
import { 
  ShoppingBag, Home as HomeIcon, Grid, Heart, ShoppingCart, 
  User as UserIcon, MapPin, CreditCard, Settings as SettingsIcon, 
  LogOut, Search, HelpCircle, LayoutDashboard
} from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('login'); // home, product-listing, profile, product-details, checkout, confirmation, dashboard, login, register, verify-otp, create-profile, profile-success
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [otpEmail, setOtpEmail] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  
  // Filtering states passed to listing page
  const [initialCategory, setInitialCategory] = useState('All');

  const { user, loading, logout } = useAuth();
  const { cartCount } = useCart();

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (currentTab === 'login' || currentTab === 'register' || currentTab === 'verify-otp') {
        setCurrentTab(user.role === 'seller' ? 'dashboard' : 'home');
      }
    }
  }, [user, currentTab]);

  const navigate = (target, message) => {
    if (!target) return;
    setTransitionMessage(message || 'Processing...');
    setTransitioning(true);
    setTimeout(() => {
      setCurrentTab(target);
      setTimeout(() => setTransitioning(false), 300);
    }, 450);
  };

  const handleProductSelect = (id) => {
    setSelectedProductId(id);
    setCurrentTab('product-details');
  };

  const handleCartCheckout = () => {
    setCartOpen(false);
    if (user) {
      setCurrentTab('checkout');
    } else {
      setCurrentTab('login');
    }
  };

  const handleOrderSuccess = (order) => {
    setConfirmedOrder(order);
    setCurrentTab('confirmation');
  };

  const handleCategorySelect = (categoryName) => {
    setInitialCategory(categoryName);
    setCurrentTab('product-listing');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentTab('product-listing');
  };

  const renderActivePage = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', margin: '150px 0' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Syncing profile...</p>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <Home 
            onSelectProduct={handleProductSelect} 
            onCategorySelect={handleCategorySelect}
            onViewAllDeals={() => handleCategorySelect('All')}
            setCartOpen={setCartOpen}
          />
        );
      
      case 'product-listing':
        return (
          <ProductListing 
            initialCategory={initialCategory}
            onSelectProduct={handleProductSelect}
            onBack={() => setCurrentTab('home')}
            setCartOpen={setCartOpen}
          />
        );

      case 'profile':
        return <UserProfile />;

      case 'login':
        return <Login setCurrentTab={setCurrentTab} setOtpEmail={setOtpEmail} navigate={navigate} />;
      
      case 'register':
        return <Register setCurrentTab={setCurrentTab} setOtpEmail={setOtpEmail} navigate={navigate} />;
      
      case 'verify-otp':
        return <VerifyOtp setCurrentTab={setCurrentTab} email={otpEmail} navigate={navigate} />;
      
      case 'create-profile':
        return <CreateProfile setCurrentTab={setCurrentTab} navigate={navigate} />;

      case 'profile-success':
        return <ProfileSuccess setCurrentTab={setCurrentTab} navigate={navigate} />;

      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            onBack={() => setCurrentTab('home')} 
            onCheckoutDirect={() => setCurrentTab('login')}
          />
        );
      
      case 'checkout':
        if (!user) {
          setCurrentTab('login');
          return null;
        }
        return (
          <Checkout 
            onOrderSuccess={handleOrderSuccess} 
            onBack={() => setCurrentTab('home')}
          />
        );
      
      case 'confirmation':
        return <OrderConfirmation order={confirmedOrder} setCurrentTab={setCurrentTab} />;
      
      case 'dashboard':
        if (user?.role !== 'seller') {
          setCurrentTab('home');
          return null;
        }
        return <Dashboard />;

      default:
        return (
          <Home 
            onSelectProduct={handleProductSelect} 
            onCategorySelect={handleCategorySelect}
            onViewAllDeals={() => handleCategorySelect('All')}
          />
        );
    }
  };

  // Determine layout style: onboarding layout vs dashboard layout
  const isOnboarding = ['login', 'register', 'verify-otp', 'create-profile', 'profile-success'].includes(currentTab);

  if (isOnboarding) {
    return (
      <div className="app-container" style={{ display: 'block' }}>
        {renderActivePage()}
        {transitioning && (
          <div className="page-transition-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{transitionMessage}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <ShoppingBag size={24} />
          <span>ShopEase</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            onClick={() => setCurrentTab('home')} 
            className={`sidebar-item ${currentTab === 'home' ? 'active' : ''}`}
          >
            <span className="sidebar-item-left">
              <HomeIcon size={18} />
              Home
            </span>
          </button>

          <button 
            onClick={() => handleCategorySelect('All')} 
            className={`sidebar-item ${currentTab === 'product-listing' ? 'active' : ''}`}
          >
            <span className="sidebar-item-left">
              <Grid size={18} />
              Categories
            </span>
          </button>

          {user && (
            <button 
              onClick={() => setCurrentTab('profile')} 
              className={`sidebar-item ${currentTab === 'profile' ? 'active' : ''}`}
            >
              <span className="sidebar-item-left">
                <ShoppingBag size={18} />
                Orders
              </span>
            </button>
          )}

          <button 
            onClick={() => alert('Wishlist feature (Simulated)')} 
            className="sidebar-item"
          >
            <span className="sidebar-item-left">
              <Heart size={18} />
              Wishlist
            </span>
          </button>

          <button 
            onClick={() => setCartOpen(true)} 
            className="sidebar-item"
          >
            <span className="sidebar-item-left">
              <ShoppingCart size={18} />
              Cart
            </span>
            {cartCount > 0 && <span className="sidebar-badge">{cartCount}</span>}
          </button>

          {user && (
            <button 
              onClick={() => setCurrentTab('profile')} 
              className={`sidebar-item ${currentTab === 'profile' ? 'active' : ''}`}
            >
              <span className="sidebar-item-left">
                <UserIcon size={18} />
                Profile
              </span>
            </button>
          )}

          {user && user.role === 'seller' && (
            <button 
              onClick={() => setCurrentTab('dashboard')} 
              className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
              style={{ color: 'var(--color-secondary)' }}
            >
              <span className="sidebar-item-left">
                <LayoutDashboard size={18} />
                Seller Deck
              </span>
            </button>
          )}

          {user && (
            <>
              <button onClick={() => setCurrentTab('profile')} className="sidebar-item">
                <span className="sidebar-item-left">
                  <MapPin size={18} />
                  Addresses
                </span>
              </button>
              
              <button onClick={() => setCurrentTab('profile')} className="sidebar-item">
                <span className="sidebar-item-left">
                  <CreditCard size={18} />
                  Payment Methods
                </span>
              </button>
            </>
          )}

          <button onClick={() => alert('Settings menu (Simulated)')} className="sidebar-item">
            <span className="sidebar-item-left">
              <SettingsIcon size={18} />
              Settings
            </span>
          </button>

          {user && (
            <button 
              onClick={() => { logout(); setCurrentTab('login'); }} 
              className="sidebar-item"
              style={{ marginTop: 'auto', color: 'var(--color-danger)' }}
            >
              <span className="sidebar-item-left">
                <LogOut size={18} />
                Logout
              </span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div>Need Help?</div>
          <a href="mailto:support@shopease.com" className="sidebar-footer-link">
            <HelpCircle size={14} />
            support@shopease.com
          </a>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header bar with search input */}
        <header className="app-header">
          <form onSubmit={handleSearchSubmit} className="search-container">
            <Search size={18} style={{ color: 'var(--text-light)', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search for products, brands and more..." 
              className="search-input"
              value={initialCategory === 'All' ? '' : initialCategory}
              onChange={(e) => setInitialCategory(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <button onClick={() => alert('Wishlist (Simulated)')} className="header-action-btn" title="View Wishlist">
              <Heart size={20} />
            </button>
            
            <button onClick={() => setCartOpen(true)} className="header-action-btn" title="Open Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="sidebar-badge" style={{ position: 'absolute', top: '-8px', right: '-8px', padding: '1px 5px', fontSize: '0.65rem' }}>
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <img 
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                  alt="User Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span>{user.name}</span>
              </div>
            ) : (
              <button onClick={() => setCurrentTab('login')} className="btn-purple" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                Login
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Inner page views */}
        <main className="main-content">
          {renderActivePage()}
        </main>
      </div>

      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckout={handleCartCheckout} 
      />

      {transitioning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{transitionMessage}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
