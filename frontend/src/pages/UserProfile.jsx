import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { ShoppingBag, CreditCard, Edit3, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UserProfile() {
  const { user, token, updateProfile, API_URL } = useAuth();
  
  // Account Form state
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

  // Orders and Cards state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cards, setCards] = useState([
    { id: '1', brand: 'Visa', last4: '4242', expiry: '12/28' }
  ]);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Load user orders from DB
  useEffect(() => {
    const fetchMyOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_URL}/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (token) {
      fetchMyOrders();
    }
  }, [API_URL, token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    const res = await updateProfile({
      name,
      phone,
      dob,
      gender,
      address,
      avatarUrl
    });

    setSubmitting(false);

    if (res.success) {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditMode(false);
    } else {
      setMessage({ text: res.message || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleAddNewCard = () => {
    const number = window.prompt('Enter 16-digit card number:');
    if (!number || number.length !== 16 || isNaN(number)) {
      alert('Invalid card number. Must be 16 digits.');
      return;
    }
    const expiry = window.prompt('Enter expiry date (MM/YY):', '12/30');
    if (!expiry) return;

    const newCard = {
      id: Date.now().toString(),
      brand: 'Visa',
      last4: number.substring(12),
      expiry: expiry
    };

    setCards([...cards, newCard]);
    alert('Payment card registered successfully!');
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>My Profile</h2>

      {message.text && (
        <div className={`auth-msg ${message.type === 'error' ? 'auth-msg-error' : 'auth-msg-success'}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '8px' }} /> : <AlertTriangle size={16} style={{ marginRight: '8px' }} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* User Info Header Card */}
      <div className="profile-card">
        <div className="profile-info-block">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="profile-avatar" 
          />
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{user?.email}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.phone || 'No phone number linked'}</p>
          </div>
        </div>

        <button 
          onClick={() => setEditMode(!editMode)} 
          className="btn-secondary"
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Edit3 size={15} />
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Account details inputs */}
        <section className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Account Details
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <label htmlFor="details-name" className="profile-detail-label">Full Name</label>
                {editMode ? (
                  <input 
                    id="details-name"
                    type="text" 
                    className="neon-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                ) : (
                  <span className="profile-detail-value">{user?.name}</span>
                )}
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-label">Email Address</span>
                <span className="profile-detail-value" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{user?.email}</span>
              </div>

              <div className="profile-detail-item">
                <label htmlFor="details-phone" className="profile-detail-label">Phone Number</label>
                {editMode ? (
                  <input 
                    id="details-phone"
                    type="text" 
                    className="neon-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                ) : (
                  <span className="profile-detail-value">{user?.phone || 'N/A'}</span>
                )}
              </div>

              <div className="profile-detail-item">
                <label htmlFor="details-dob" className="profile-detail-label">Date of Birth</label>
                {editMode ? (
                  <input 
                    id="details-dob"
                    type="date" 
                    className="neon-input" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    required 
                  />
                ) : (
                  <span className="profile-detail-value">{user?.dob || 'N/A'}</span>
                )}
              </div>

              <div className="profile-detail-item">
                <label htmlFor="details-gender" className="profile-detail-label">Gender</label>
                {editMode ? (
                  <select 
                    id="details-gender"
                    className="neon-input" 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <span className="profile-detail-value">{user?.gender || 'N/A'}</span>
                )}
              </div>

              <div className="profile-detail-item">
                <label htmlFor="details-address" className="profile-detail-label">Address</label>
                {editMode ? (
                  <input 
                    id="details-address"
                    type="text" 
                    className="neon-input" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                  />
                ) : (
                  <span className="profile-detail-value">{user?.address || 'N/A'}</span>
                )}
              </div>
            </div>

            {editMode && (
              <button 
                type="submit" 
                className="btn-purple" 
                style={{ marginTop: '2rem', width: '150px' }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Details'}
              </button>
            )}
          </form>
        </section>

        {/* Side columns: Orders & Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Orders Section */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>My Orders</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>View All</span>
            </div>

            {loadingOrders ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No orders placed yet.</p>
            ) : (
              <div className="orders-list">
                {orders.slice(0, 3).map(order => (
                  <div key={order._id} className="order-list-item">
                    <div className="order-item-detail">
                      <div className="order-item-icon">
                        <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="order-item-info">
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Order #{order._id.substring(18)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{Math.round(order.totalPrice).toLocaleString('en-IN')}</span>
                      <span className={order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-cyan'} style={{ padding: '2px 6px', fontSize: '0.65rem', marginTop: '2px' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Payments Section */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Payment Methods</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>View All</span>
            </div>

            <div className="orders-list">
              {cards.map(card => (
                <div key={card.id} className="payment-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>•••• •••• •••• {card.last4}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expires {card.expiry}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={handleAddNewCard}
              className="add-card-link"
              style={{ marginTop: '1rem', border: 'none', background: 'none' }}
            >
              <Plus size={16} /> Add New Card
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
