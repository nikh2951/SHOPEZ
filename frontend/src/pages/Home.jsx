import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Star, Eye, Percent, ArrowRight, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export default function Home({ onSelectProduct, onCategorySelect, onViewAllDeals, setCartOpen }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API_URL } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        if (data.success) {
          // Show deals (items with discounts first)
          const sorted = data.products.sort((a, b) => b.discount - a.discount);
          setProducts(sorted);
        }
      } catch (err) {
        console.error('Failed to load deals', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [API_URL]);

  const categories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Home & Kitchen', icon: '🍳' },
    { name: 'Beauty', icon: '✨' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Books', icon: '📚' }
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero">
        <div className="hero-content">
          <span className="hero-tag">Big Fashion Sale</span>
          <h1>Up to 70% Off<br /><span style={{ fontWeight: 400 }}>On Top Brands</span></h1>
          <p style={{ margin: '1rem 0' }}>Explore next-generation style statements and premium items.</p>
          <button 
            onClick={() => onCategorySelect('Fashion')} 
            className="btn-purple"
          >
            Shop Now
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" 
          alt="Fashion sale banner" 
          className="hero-img" 
          style={{ borderRadius: '12px' }}
        />
      </div>

      {/* Categories Circles List */}
      <div className="categories-circles-container">
        <div className="section-header">
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Categories</h3>
          <button 
            onClick={() => onCategorySelect('All')} 
            className="section-link"
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            View All
          </button>
        </div>

        <div className="categories-circles">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="category-circle-item"
              onClick={() => onCategorySelect(cat.name)}
            >
              <div className="category-circle-icon">{cat.icon}</div>
              <span className="category-circle-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Deals of the Day */}
      <div>
        <div className="section-header">
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Deals of the Day</h3>
          <button 
            onClick={onViewAllDeals} 
            className="section-link"
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Fetching hot deals...</p>
          </div>
        ) : products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No deals available at the moment.</p>
        ) : (
          <div className="product-grid">
            {products.slice(0, 4).map((product) => {
              const discountedPrice = product.price - (product.price * product.discount) / 100;
              return (
                <div key={product._id} className="card product-card">
                  <div>
                    <div className="product-image-container">
                      {product.discount > 0 && (
                        <div className="product-discount-tag">
                          <Percent size={12} style={{ marginRight: '3px' }} />
                          {product.discount}% OFF
                        </div>
                      )}
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'} 
                        alt={product.name} 
                        className="product-image"
                      />
                    </div>

                    <div className="product-details">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-name" style={{ fontSize: '0.95rem' }}>{product.name}</h3>
                      
                      <div className="product-rating">
                        <Star size={14} fill={product.rating > 0 ? '#ffb700' : 'none'} stroke={product.rating > 0 ? '#ffb700' : 'currentColor'} />
                        <span>
                          {product.rating > 0 ? product.rating : 'New'} ({product.numReviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="product-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div className="price-container">
                        {product.discount > 0 && (
                          <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                        <span className="active-price">₹{Math.round(discountedPrice).toLocaleString('en-IN')}</span>
                      </div>

                      <button 
                        type="button"
                        className="qty-btn" 
                        onClick={() => onSelectProduct(product._id)} 
                        title="Inspect specs"
                        style={{ padding: '0 8px', fontSize: '0.8rem', display: 'flex', gap: '4px', height: '32px' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>

                    {product.inventory > 0 ? (
                      <button 
                        type="button"
                        className="btn-purple" 
                        onClick={() => {
                          addToCart(product, 1);
                          if (setCartOpen) setCartOpen(true);
                        }}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    ) : (
                      <span className="badge-red" style={{ fontSize: '0.75rem', textAlign: 'center', padding: '6px 0', display: 'block', width: '100%' }}>Out of Stock</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Home.propTypes = {
  onSelectProduct: PropTypes.func.isRequired,
  onCategorySelect: PropTypes.func.isRequired,
  onViewAllDeals: PropTypes.func.isRequired,
  setCartOpen: PropTypes.func,
};
