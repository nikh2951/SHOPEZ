import PropTypes from 'prop-types';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="cart-drawer-overlay"
          onClick={onClose}
          aria-label="Close cart drawer"
        />
      )}
      <div 
        className="cart-drawer" 
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>My Cart</h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Explore products to add items here.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const discountedPrice = item.price - (item.price * item.discount) / 100;
              return (
                <div key={item.product} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <img 
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120'} 
                    alt={item.name} 
                    style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#f1f5f9' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.name}</div>
                    
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                      {item.discount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginLeft: '8px', fontWeight: 600 }}>
                          -{item.discount}% Off
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button 
                          className="qty-btn" 
                          style={{ width: '24px', height: '24px', padding: 0 }}
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                        <button 
                          className="qty-btn" 
                          style={{ width: '24px', height: '24px', padding: 0 }}
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }} onClick={() => removeFromCart(item.product)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
            </div>
            
            {!user && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Please login to checkout.</span>
              </div>
            )}

            <button 
              className="btn-purple" 
              onClick={onCheckout}
              style={{ width: '100%', padding: '12px' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

CartDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired,
};
