import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3, Save, CheckCircle, BarChart2, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { token, API_URL } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, products, orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Add Product Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Cyberware');
  const [discount, setDiscount] = useState('0');
  const [inventory, setInventory] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const triggerMsg = useCallback((text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch(`${API_URL}/products/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      // Fetch Orders
      const ordRes = await fetch(`${API_URL}/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
      }
    } catch (err) {
      console.error(err);
      triggerMsg('Network mismatch. Unable to fetch merchant registers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, triggerMsg]);

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboardData();
    };

    loadDashboard();
  }, [fetchDashboardData]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Cyberware');
    setDiscount('0');
    setInventory('10');
    setImageUrl('');
    setDescription('');
    setEditProductId(null);
    setShowAddForm(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      triggerMsg('Incomplete form nodes. Fill out name, price, and description.', 'error');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      category,
      discount: Number(discount),
      inventory: Number(inventory),
      imageUrl,
    };

    try {
      let url = `${API_URL}/products`;
      let method = 'POST';

      if (editProductId) {
        url = `${API_URL}/products/${editProductId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        triggerMsg(editProductId ? 'Product parameters updated successfully!' : 'Product registry added successfully!');
        resetForm();
        fetchDashboardData();
      } else {
        triggerMsg(data.message || 'Transaction rejected by db.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerMsg('Server mismatch. Fail to submit product values.', 'error');
    }
  };

  const handleEditInit = (product) => {
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDiscount(product.discount.toString());
    setInventory(product.inventory.toString());
    setImageUrl(product.imageUrl || '');
    setDescription(product.description);
    setEditProductId(product._id);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Acknowledge: Initiate product deletion protocol? This action is irreversible.')) return;

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        triggerMsg('Product deleted successfully.');
        fetchDashboardData();
      } else {
        triggerMsg(data.message || 'Deletion rejected.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerMsg('Server issue, deletion unsuccessful.', 'error');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        triggerMsg(`Order status advanced to: ${newStatus}`);
        fetchDashboardData();
      } else {
        triggerMsg(data.message || 'Status change rejected.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerMsg('Connection failed during status change.', 'error');
    }
  };

  // Calculations for Overview HUD
  const totalEarnings = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalItemsPriceForSeller, 0);
  
  const totalItemsSold = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.orderItems.reduce((sum, item) => sum + item.quantity, 0), 0);

  const activeOrdersCount = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '150px 0' }}>
        <div className="pulse-purple-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--color-secondary)', margin: '0 auto', animation: 'pulse-purple 1.5s infinite' }}></div>
        <p style={{ marginTop: '20px', fontFamily: 'var(--font-title)', color: 'var(--color-secondary)' }}>Decrypting Merchant HUD...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ borderBottom: '1px solid var(--border-purple)', paddingBottom: '20px', marginBottom: '35px' }}>
        <h1 style={{ textShadow: 'var(--glow-purple)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard className="icon-purple" style={{ color: 'var(--color-secondary)', filter: 'drop-shadow(0 0 5px var(--color-secondary))' }} />
          MERCHANT DECK CONSOLE
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure product channels, monitor sales vectors, and deploy delivery dropships</p>
      </div>

      {msg.text && (
        <div className={`auth-msg ${msg.type === 'error' ? 'auth-msg-error' : 'auth-msg-success'}`} style={{ marginBottom: '25px' }}>
          {msg.type === 'error' ? <ShieldAlert size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> : <CheckCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="dashboard-container">
        {/* Left Sidebar Menu */}
        <div className="dashboard-sidebar">
          <button 
            className={`db-sidebar-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <BarChart2 size={16} /> Overview HUD
          </button>
          <button 
            className={`db-sidebar-btn ${activeSubTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('products')}
          >
            <Package size={16} /> My Inventory ({products.length})
          </button>
          <button 
            className={`db-sidebar-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            <ShoppingBag size={16} /> Customer Orders ({orders.length})
          </button>
        </div>

        {/* Right Tab Contents */}
        <div className="dashboard-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="hud-grid">
                <div className="glass-panel stat-card pulse-cyan-glow">
                  <div className="stat-info">
                    <span className="stat-label">Total Cargo Earnings</span>
                    <span className="stat-value">${totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="stat-icon">💰</div>
                </div>

                <div className="glass-panel-purple stat-card pulse-purple-glow">
                  <div className="stat-info">
                    <span className="stat-label">Merchant Units Sold</span>
                    <span className="stat-value">{totalItemsSold} Units</span>
                  </div>
                  <div className="stat-icon purple">📦</div>
                </div>

                <div className="glass-panel stat-card" style={{ border: '1px solid rgba(0, 255, 102, 0.2)' }}>
                  <div className="stat-info">
                    <span className="stat-label">Transit Cargo Queues</span>
                    <span className="stat-value" style={{ color: 'var(--color-accent)' }}>{activeOrdersCount} Queue</span>
                  </div>
                  <div className="stat-icon green">✈</div>
                </div>
              </div>

              {/* Dynamic bar charts built strictly via CSS */}
              <div className="glass-panel-purple">
                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>LOGISTICS SALES TREND GRAPH</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Dynamic credit returns on cargo items cataloged over week cycles</p>
                
                <div className="analytics-chart-hud">
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ height: '35%' }} data-value="$120"></div>
                    <div className="chart-bar purple" style={{ height: '55%' }} data-value="$340"></div>
                    <div className="chart-bar" style={{ height: '20%' }} data-value="$80"></div>
                    <div className="chart-bar purple" style={{ height: '85%' }} data-value="$720"></div>
                    <div className="chart-bar" style={{ height: '65%' }} data-value="$490"></div>
                    <div className="chart-bar purple" style={{ height: '95%' }} data-value="$980"></div>
                    <div className="chart-bar" style={{ height: '40%' }} data-value="$210"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeSubTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>MERCHANT INVENTORY INDEX</h3>
                <button 
                  className="btn-neon-purple" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> {showAddForm ? 'Close Add Form' : 'Register New Asset'}
                </button>
              </div>

              {showAddForm && (
                <div className="glass-panel-purple" style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-secondary)', marginBottom: '20px' }}>
                    {editProductId ? 'MODIFY REGISTER PARAMETERS' : 'REGISTER NEW ASSET SPECIFICATIONS'}
                  </h4>

                  <form onSubmit={handleAddSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label htmlFor="product-name" className="neon-label">Asset Name</label>
                        <input 
                          id="product-name"
                          type="text" 
                          className="neon-input" 
                          placeholder="e.g. Neural Linker V2" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{ border: '1px solid var(--border-purple)' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="product-category" className="neon-label">Category Protocol</label>
                        <select 
                          id="product-category"
                          className="neon-input"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          style={{ border: '1px solid var(--border-purple)' }}
                        >
                          <option value="Cyberware">Cyberware</option>
                          <option value="Wearables">Wearables</option>
                          <option value="Holographics">Holographics</option>
                          <option value="Software">Software</option>
                          <option value="Hardware">Hardware</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label htmlFor="product-price" className="neon-label">Base Price (USD)</label>
                        <input 
                          id="product-price"
                          type="number" 
                          className="neon-input" 
                          placeholder="150" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          min={0}
                          style={{ border: '1px solid var(--border-purple)' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="product-discount" className="neon-label">Discount Rate (%)</label>
                        <input 
                          id="product-discount"
                          type="number" 
                          className="neon-input" 
                          placeholder="0" 
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          min={0}
                          max={100}
                          style={{ border: '1px solid var(--border-purple)' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="product-inventory" className="neon-label">Cargo Count (Stock)</label>
                        <input 
                          id="product-inventory"
                          type="number" 
                          className="neon-input" 
                          placeholder="10" 
                          value={inventory}
                          onChange={(e) => setInventory(e.target.value)}
                          required
                          min={0}
                          style={{ border: '1px solid var(--border-purple)' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label htmlFor="product-image-url" className="neon-label">Visual Asset URL (Image)</label>
                      <input 
                        id="product-image-url"
                        type="url" 
                        className="neon-input" 
                        placeholder="https://images.unsplash.com/... or blank for default" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        style={{ border: '1px solid var(--border-purple)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="product-description" className="neon-label">Technical Description Matrix</label>
                      <textarea 
                        id="product-description"
                        rows={4} 
                        className="neon-input" 
                        placeholder="Specify technological upgrades, power inputs, specs..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ border: '1px solid var(--border-purple)', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button type="submit" className="btn-neon-purple" style={{ flex: 1 }}>
                        <Save size={16} style={{ marginRight: '8px' }} /> {editProductId ? 'DEPLOY MODIFIED VALUES' : 'DEPLOY TO MARKETPLACE'}
                      </button>
                      <button type="button" className="filter-btn" onClick={resetForm} style={{ width: '120px' }}>
                        Abort
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="glass-panel">
                <div className="custom-table-container">
                  {products.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No products registered under your merchant index node.</p>
                  ) : (
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Visual</th>
                          <th>Asset Name</th>
                          <th>Category</th>
                          <th>Net Price</th>
                          <th>Stock Levels</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => {
                          const netPrice = prod.price - (prod.price * prod.discount) / 100;
                          return (
                            <tr key={prod._id}>
                              <td>
                                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d111c', borderRadius: '4px', padding: '2px' }}>
                                  <img 
                                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80'} 
                                    alt="" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                  />
                                </div>
                              </td>
                              <td style={{ fontWeight: 'bold', color: 'var(--text-bright)' }}>{prod.name}</td>
                              <td>{prod.category}</td>
                              <td style={{ fontFamily: 'var(--font-data)' }}>
                                ${netPrice.toFixed(2)}
                                {prod.discount > 0 && <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>${prod.price}</span>}
                              </td>
                              <td>
                                {prod.inventory > 5 ? (
                                  <span className="badge-green">Glow {prod.inventory} Units</span>
                                ) : prod.inventory > 0 ? (
                                  <span className="badge-purple" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}>Low {prod.inventory} Units</span>
                                ) : (
                                  <span className="badge-red">DEPLETED</span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                  <button className="qty-btn" style={{ width: '30px', height: '30px', border: '1px solid var(--border-cyan)' }} onClick={() => handleEditInit(prod)} title="Edit Asset">
                                    <Edit3 size={12} style={{ color: 'var(--color-primary)' }} />
                                  </button>
                                  <button className="qty-btn" style={{ width: '30px', height: '30px', border: '1px solid rgba(255,60,0,0.3)' }} onClick={() => handleDelete(prod._id)} title="Delete Asset">
                                    <Trash2 size={12} style={{ color: 'var(--color-warning)' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS */}
          {activeSubTab === 'orders' && (
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>CUSTOMER ORDER TRANSITS</h3>
              
              <div className="custom-table-container">
                {orders.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No transits registered in merchant queue.</p>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Order Hash</th>
                        <th>Purchaser</th>
                        <th>Dest. City</th>
                        <th>Manifest</th>
                        <th>Order Income</th>
                        <th>Transit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id}>
                          <td style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                            #{ord._id.substring(0, 10)}...
                          </td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-bright)' }}>{ord.customer?.name || 'Recruit'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</div>
                          </td>
                          <td>{ord.shippingAddress?.city}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {ord.orderItems.map((item, i) => (
                                <span key={i} style={{ fontSize: '0.8rem' }}>
                                  - {item.name} <strong>x{item.quantity}</strong>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-data)', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                            ${ord.totalItemsPriceForSeller.toFixed(2)}
                          </td>
                          <td>
                            <select
                              className="neon-input"
                              value={ord.status}
                              onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                              style={{ 
                                padding: '6px 10px', 
                                fontSize: '0.8rem',
                                color: ord.status === 'delivered' ? 'var(--color-accent)' : ord.status === 'cancelled' ? 'var(--color-warning)' : 'var(--color-primary)',
                                borderColor: ord.status === 'delivered' ? 'rgba(0, 255, 102, 0.3)' : ord.status === 'cancelled' ? 'rgba(255, 60, 0, 0.3)' : 'rgba(0, 240, 255, 0.3)',
                                background: 'rgba(0,0,0,0.3)',
                                width: '130px'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
