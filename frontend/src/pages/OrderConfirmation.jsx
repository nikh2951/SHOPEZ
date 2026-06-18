import PropTypes from 'prop-types';
import { CheckCircle, Truck, Printer, MapPin } from 'lucide-react';

export default function OrderConfirmation({ order, setCurrentTab }) {
  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>No active confirmation record found.</p>
        <button className="btn-purple" style={{ marginTop: '20px' }} onClick={() => setCurrentTab('home')}>
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    globalThis.print?.();
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div 
          style={{ 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            background: 'var(--color-primary-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'var(--color-primary)'
          }}
        >
          <CheckCircle size={36} />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
          ✓ Your order has been placed successfully and stock is reserved.
        </p>
      </div>

      <div className="card">
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Invoice Details</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
            Order ID: #{order._id}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px', fontSize: '0.85rem' }}>
          <div>
            <h4 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Shipping Address</h4>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
              <MapPin size={12} style={{ marginTop: '2px', color: 'var(--text-muted)' }} />
              <div>
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Order Information</h4>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Status:</strong> <span className="badge-green" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{order.status}</span></p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>Order Items</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.orderItems.map((item) => {
              const discountedPrice = item.price - (item.price * item.discount) / 100;
              return (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>
                    {item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    ₹{Math.round(discountedPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>₹{Math.round(order.itemsPrice).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>GST Tax</span>
            <span>₹{order.taxPrice.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Shipping Charge</span>
            <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            <span>Total Paid</span>
            <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button className="btn-secondary" style={{ flex: 1, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handlePrint}>
          <Printer size={16} /> Print Invoice
        </button>
        <button className="btn-purple" style={{ flex: 1, borderRadius: '8px' }} onClick={() => setCurrentTab('home')}>
          Continue Shopping
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Truck size={16} style={{ color: 'var(--color-primary)' }} />
        <span>Your items are being packed and will be shipped soon!</span>
      </div>
    </div>
  );
}

OrderConfirmation.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    shippingAddress: PropTypes.shape({
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      postalCode: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    orderItems: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
        discount: PropTypes.number,
      })
    ).isRequired,
    itemsPrice: PropTypes.number.isRequired,
    taxPrice: PropTypes.number.isRequired,
    shippingPrice: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
  }).isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};
