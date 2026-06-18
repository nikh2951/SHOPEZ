const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, sellerOnly } = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    Get all products (public)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    const brand = req.query.brand
      ? { brand: { $in: req.query.brand.split(',') } }
      : {};

    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.price = {};
      if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    const products = await Product.find({
      ...keyword,
      ...category,
      ...brand,
      ...priceFilter,
    }).populate('seller', 'name email');

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving products' });
  }
});

/**
 * @route   GET /api/products/seller
 * @desc    Get seller's products (seller only)
 * @access  Private/Seller
 */
router.get('/seller', protect, sellerOnly, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving seller products' });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product details by ID (public)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving product details' });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a product (seller only)
 * @access  Private/Seller
 */
router.post('/', protect, sellerOnly, async (req, res) => {
  const { name, price, description, category, discount, imageUrl, inventory } = req.body;

  if (!name || !price || !description || !category) {
    return res.status(400).json({ success: false, message: 'Please provide name, price, description, and category' });
  }

  try {
    const product = new Product({
      name,
      price,
      description,
      category,
      discount: discount || 0,
      imageUrl: imageUrl || '',
      inventory: inventory !== undefined ? inventory : 10,
      seller: req.user.id,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (seller only, owner validation)
 * @access  Private/Seller
 */
router.put('/:id', protect, sellerOnly, async (req, res) => {
  const { name, price, description, category, discount, imageUrl, inventory } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure the seller owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    }

    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.discount = discount !== undefined ? discount : product.discount;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.inventory = inventory !== undefined ? inventory : product.inventory;

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (seller only, owner validation)
 * @access  Private/Seller
 */
router.delete('/:id', protect, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure the seller owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Create a product review (customer only)
 * @access  Private
 */
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  if (rating === undefined || !comment) {
    return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed the product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed by this user' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user.id,
    };

    product.reviews.push(review);
    product.calculateAverageRating();

    await product.save();
    res.status(201).json({ success: true, message: 'Review added successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error adding review' });
  }
});

module.exports = router;
