const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  const seedProducts = require('./utils/seeder');
  seedProducts();
});

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// API health route
app.get('/api/health', (req, res) => {
  res.json({ message: 'ShopEZ Futuristic API Server is running online...' });
});

// Serve React static files from frontend build when available
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(indexHtmlPath);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 1529;

app.listen(PORT, () => {
  console.log(`Server running in production-ready mode on port ${PORT}`);
});
