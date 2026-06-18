const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, sellerOnly } = require('../middleware/auth');

/**
 * @route   POST /api/orders
 * @desc    Create a new order (checkout)
 * @access  Private (Customer)
 */
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  try {
    // Verify stock and fetch correct seller ids for each product
    const verifiedOrderItems = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      
      if (product.inventory < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient inventory for ${product.name}. Available: ${product.inventory}, Requested: ${item.quantity}` 
        });
      }

      // Deduct stock
      product.inventory -= item.quantity;
      await product.save();

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        seller: product.seller,
      });
    }

    const order = new Order({
      customer: req.user.id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true, // Auto-pay simulated for simplicity in this futuristic checkout
      paidAt: Date.now(),
      status: 'pending',
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error processing checkout' });
  }
});

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged in user orders (customer flow)
 * @access  Private
 */
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving your orders' });
  }
});

/**
 * @route   GET /api/orders/seller
 * @desc    Get orders containing products from this seller (seller flow)
 * @access  Private/Seller
 */
router.get('/seller', protect, sellerOnly, async (req, res) => {
  try {
    // Find orders where at least one orderItem has seller matching logged-in seller
    const orders = await Order.find({
      'orderItems.seller': req.user.id,
    })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // Filter orderItems to only include those belonging to this seller for clarity in dashboard display
    const sellerOrders = orders.map((order) => {
      const filteredItems = order.orderItems.filter(
        (item) => item.seller.toString() === req.user.id
      );

      return {
        _id: order._id,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        createdAt: order.createdAt,
        totalItemsPriceForSeller: filteredItems.reduce((acc, item) => {
          const discountAmt = (item.price * item.discount) / 100;
          return acc + (item.price - discountAmt) * item.quantity;
        }, 0),
        orderItems: filteredItems,
      };
    });

    res.status(200).json({ success: true, orders: sellerOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving seller orders' });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (seller only)
 * @access  Private/Seller
 */
router.put('/:id/status', protect, sellerOnly, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update value' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify this seller has products in this order
    const hasSellerProduct = order.orderItems.some(
      (item) => item.seller.toString() === req.user.id
    );

    if (!hasSellerProduct) {
      return res.status(403).json({ success: false, message: 'Not authorized to update status of this order' });
    }

    order.status = status;
    if (status === 'shipped') {
      order.shippedAt = Date.now();
    } else if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
});

module.exports = router;
