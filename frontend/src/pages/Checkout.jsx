import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { MapPin, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react';

export default function Checkout({ onOrderSuccess, onBack }) {
  const { cartItems, subtotal, clearCart } = useCart();
  const { token, API_URL } = useAuth();
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculations
  const shippingPrice = subtotal > 1500 ? 0 : 99;
  const taxPrice = Math.round(subtotal * 0.18); // 18% GST standard in India
  const totalPrice = subtotal + shippingPrice + taxPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please enter your complete shipping address.');
      return;
    }
    
    if (!cardNumber || !expiry || !cvv) {
      setError('Please provide your payment card details.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          seller: item.seller,
        })),
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: 'Credit Card',
        itemsPrice: subtotal,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        clearCart();
        onOrderSuccess(data.order);
      } else {
        setError(data.message || 'Payment or order creation failed.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Failed to establish connection to checkout API.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Checkout</h2>
      
      {error && (
        <div className="auth-msg auth-msg-error" style={{ marginBottom: '25px' }}>
          <AlertCircle size={16} style={{ marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
        
        {/* Left Form Panel */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <MapPin size={18} /> Shipping Address
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="checkout-address" className="neon-label">Street Address</label>
              <input 
                id="checkout-address"
                type="text" 
                className="neon-input" 
                placeholder="Flat No, Block, Street Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
              <div>
                <label htmlFor="checkout-city" className="neon-label">City</label>
                <input 
                  id="checkout-city"
                  type="text" 
                  className="neon-input" 
                  placeholder="Hyderabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="checkout-postal-code" className="neon-label">Postal Code</label>
                <input 
                  id="checkout-postal-code"
                  type="text" 
                  className="neon-input" 
                  placeholder="500001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout-country" className="neon-label">Country</label>
              <input 
                id="checkout-country"
                type="text" 
                className="neon-input" 
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <CreditCard size={18} /> Payment Information
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="checkout-card-number" className="neon-label">Card Number</label>
              <input 
                id="checkout-card-number"
                type="text" 
                className="neon-input" 
                placeholder="4000 1284 9283 0041"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label htmlFor="checkout-expiry" className="neon-label">Expiration (MM/YY)</label>
                <input 
                  id="checkout-expiry"
                  type="text" 
                  className="neon-input" 
                  placeholder="08/29"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="checkout-cvv" className="neon-label">CVV</label>
                <input 
                  id="checkout-cvv"
                  type="password" 
                  className="neon-input" 
                  placeholder="•••"
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-purple" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Right Cargo Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <ShoppingBag size={18} /> Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
              {cartItems.map((item) => {
                const discountedPrice = item.price - (item.price * item.discount) / 100;
                return (
                  <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} x ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      ₹{Math.round(discountedPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-body)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (GST 18%)</span>
                <span>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping Fee</span>
                <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px', color: 'var(--color-primary)' }}>
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              style={{ width: '100%', borderRadius: '8px' }}
              onClick={onBack}
            >
              Modify Cart Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Checkout.propTypes = {
  onOrderSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
