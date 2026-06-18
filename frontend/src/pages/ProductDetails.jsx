import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { Star, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export default function ProductDetails({ productId, onBack, onCheckoutDirect }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  const { user, token, API_URL } = useAuth();
  const { addToCart } = useCart();

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, productId]);

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
  }, [productId, fetchProduct]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      setReviewError('Please write your review comment.');
      return;
    }

    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      
      if (data.success) {
        setReviewSuccess('Review submitted successfully.');
        setComment('');
        setRating(5);
        fetchProduct();
      } else {
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setReviewError('Error submitting review.');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, qty);
      setReviewSuccess(`Added ${qty} items to your cart!`);
      setTimeout(() => setReviewSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Product not found.</p>
        <button className="btn-purple" style={{ marginTop: '20px' }} onClick={onBack}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const discountedPrice = product.price - (product.price * product.discount) / 100;

  return (
    <div>
      <button 
        className="back-link" 
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
        {/* Left: Product Image */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', minHeight: '350px' }}>
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
          />
        </div>

        {/* Right: Product Details Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <span className="badge-cyan">{product.category}</span>
              {product.inventory > 0 ? (
                <span className="badge-green">In Stock ({product.inventory})</span>
              ) : (
                <span className="badge-red">Out of Stock</span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{product.name}</h1>

            <div className="product-rating" style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              <Star size={16} fill={product.rating > 0 ? '#ffb700' : 'none'} stroke={product.rating > 0 ? '#ffb700' : 'currentColor'} />
              <strong style={{ color: '#ffb700' }}>{product.rating > 0 ? product.rating : 'N/A'}</strong>
              <span style={{ marginLeft: '5px' }}>({product.numReviews} Reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '1.15rem' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="badge-red" style={{ fontSize: '0.75rem' }}>
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {product.description}
            </p>
          </div>

          <div>
            {product.inventory > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                  <span className="neon-label" style={{ marginBottom: 0 }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                      className="qty-btn" 
                      onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '35px', textAlign: 'center', fontWeight: 'bold' }}>{qty}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => setQty(prev => Math.min(product.inventory, prev + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    className="btn-purple" 
                    style={{ flex: 1, padding: '12px' }}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                </div>
              </>
            ) : (
              <div 
                className="badge-red" 
                style={{ 
                  textAlign: 'center', 
                  padding: '12px',
                  display: 'block',
                  fontSize: '0.9rem'
                }}
              >
                Temporarily out of stock.
              </div>
            )}

            {reviewSuccess && (
              <p style={{ color: 'var(--color-success)', marginTop: '15px', fontSize: '0.9rem', fontWeight: 600 }}>
                ✓ {reviewSuccess}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Product Reviews ({product.reviews.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {product.reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No reviews for this product yet.
            </p>
          ) : (
            product.reviews.map((review) => (
              <div key={review._id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <User size={14} style={{ color: 'var(--text-muted)' }} /> {review.name}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <div style={{ display: 'flex', color: '#ffb700' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? '#ffb700' : 'none'} 
                          stroke={i < review.rating ? '#ffb700' : 'currentColor'} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Review */}
        {user ? (
          user.role === 'customer' ? (
            <div className="card" style={{ marginTop: '2.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>Add a Review</h4>
              
              {reviewError && (
                <div className="auth-msg auth-msg-error" style={{ marginBottom: '15px' }}>
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="review-rating" className="neon-label">Rating</label>
                  <select 
                    id="review-rating"
                    className="neon-input" 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="review-comment" className="neon-label">Your Comment</label>
                  <textarea 
                    id="review-comment"
                    rows={4} 
                    className="neon-input" 
                    placeholder="Write your review commentary here..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-purple">
                  Submit Review
                </button>
              </form>
            </div>
          ) : null
        ) : (
          <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '0.85rem' }}>
            * Please{' '}
            <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onCheckoutDirect(); }}>
              login
            </a>{' '}
            to submit a product review.
          </p>
        )}
      </div>
    </div>
  );
}

ProductDetails.propTypes = {
  productId: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onCheckoutDirect: PropTypes.func.isRequired,
};
