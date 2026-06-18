import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { Search, Star, Eye, Percent, ArrowLeft, SlidersHorizontal, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export default function ProductListing({ initialCategory, onSelectProduct, onBack, setCartOpen }) {
  const { API_URL } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const categories = ['All', 'Mobiles', 'Laptops', 'Headphones', 'Cameras', 'Accessories'];
  const brands = ['Apple', 'Samsung', 'boAt', 'Sony', 'OnePlus'];
  const priceRanges = [
    { label: 'All', min: null, max: null },
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: 'Above ₹10,000', min: 10000, max: 1000000 },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = [];
      if (search) params.push(`keyword=${encodeURIComponent(search)}`);
      if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
      if (selectedBrands.length > 0) params.push(`brand=${encodeURIComponent(selectedBrands.join(','))}`);
      
      // Map selected price range
      const activeRange = priceRanges.find(r => r.label === priceRange);
      if (activeRange) {
        if (activeRange.min !== null) params.push(`minPrice=${activeRange.min}`);
        if (activeRange.max !== null) params.push(`maxPrice=${activeRange.max}`);
      }

      let url = `${API_URL}/products`;
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let items = data.products;

        // Apply local sorting
        if (sortBy === 'price-low') {
          items.sort((a, b) => {
            const priceA = a.price - (a.price * a.discount) / 100;
            const priceB = b.price - (b.price * b.discount) / 100;
            return priceA - priceB;
          });
        } else if (sortBy === 'price-high') {
          items.sort((a, b) => {
            const priceA = a.price - (a.price * a.discount) / 100;
            const priceB = b.price - (b.price * b.discount) / 100;
            return priceB - priceA;
          });
        } else if (sortBy === 'rating') {
          items.sort((a, b) => b.rating - a.rating);
        }

        setProducts(items);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, search, category, selectedBrands, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleBrandChange = (brandName) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  const handleClearFilters = () => {
    setCategory('All');
    setSelectedBrands([]);
    setPriceRange('All');
    setSearch('');
    setSortBy('popular');
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={onBack} className="back-link" style={{ margin: 0 }}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      <div className="listing-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} /> Filters
            </h3>
            <button onClick={handleClearFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h4 className="filter-title">Categories</h4>
            <div className="filter-list">
              {categories.map(cat => (
                <label key={cat} className="filter-checkbox-label">
                  <input 
                    type="radio" 
                    name="category-filter" 
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range</h4>
            <div className="filter-list">
              {priceRanges.map(range => (
                <label key={range.label} className="filter-checkbox-label">
                  <input 
                    type="radio" 
                    name="price-filter" 
                    checked={priceRange === range.label}
                    onChange={() => setPriceRange(range.label)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="filter-section">
            <h4 className="filter-title">Brands</h4>
            <div className="filter-list">
              {brands.map(b => (
                <label key={b} className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(b)}
                    onChange={() => handleBrandChange(b)}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {/* Top filter results bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong>{products.length}</strong> products matching your criteria
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="neon-input" 
                style={{ width: '180px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Average Rating</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ marginBottom: '10px' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => {
                  const netPrice = product.price - (product.price * product.discount) / 100;
                  return (
                    <div key={product._id} className="card product-card">
                      <div>
                        <div className="product-image-container">
                          {product.discount > 0 && (
                            <div className="product-discount-tag">
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
                            <span>{product.rating > 0 ? product.rating : 'New'} ({product.numReviews})</span>
                          </div>
                        </div>
                                        <div className="product-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="price-container">
                            {product.discount > 0 && (
                              <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
                            )}
                            <span className="active-price">₹{Math.round(netPrice).toLocaleString('en-IN')}</span>
                          </div>

                          <button 
                            type="button" 
                            className="qty-btn"
                            onClick={() => onSelectProduct(product._id)}
                            title="Inspect product specs"
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

              {/* Pagination */}
              <div className="pagination">
                <button 
                  className="pagination-btn" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <button className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
                <button className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
                <button className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
                <button 
                  className="pagination-btn" 
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

ProductListing.propTypes = {
  initialCategory: PropTypes.string,
  onSelectProduct: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  setCartOpen: PropTypes.func,
};
