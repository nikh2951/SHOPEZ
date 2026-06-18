const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const seedProducts = async () => {
  try {
    // Check if seller already exists, if not create one
    let seller = await User.findOne({ email: 'seller@shopease.com' });
    if (!seller) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      seller = await User.create({
        name: 'ShopEase Prime Merchant',
        email: 'seller@shopease.com',
        password: hashedPassword,
        role: 'seller',
        isVerified: true,
      });
      console.log('Mock seller account created: seller@shopease.com / password123');
    }

    // Check if products exist, seed if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          name: 'iPhone 14',
          description: 'A grand new iPhone with the latest chip, outstanding cameras, and a beautiful screen.',
          price: 58999,
          discount: 5,
          category: 'Mobiles',
          brand: 'Apple',
          inventory: 20,
          imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500',
          seller: seller._id,
          rating: 4.5,
          numReviews: 120,
        },
        {
          name: 'Samsung S23',
          description: 'High-performance flagship Android phone with incredible zoom and nightography features.',
          price: 49999,
          discount: 10,
          category: 'Mobiles',
          brand: 'Samsung',
          inventory: 15,
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
          seller: seller._id,
          rating: 4.3,
          numReviews: 98,
        },
        {
          name: 'Sony WH-1000XM4',
          description: 'Industry-leading noise canceling overhead wireless headphones with premium sound quality.',
          price: 19990,
          discount: 0,
          category: 'Headphones',
          brand: 'Sony',
          inventory: 25,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          seller: seller._id,
          rating: 4.6,
          numReviews: 74,
        },
        {
          name: 'MacBook Air M2',
          description: 'Supercharged by M2, incredibly thin, aluminum casing, all-day battery life, liquid retina display.',
          price: 99590,
          discount: 8,
          category: 'Laptops',
          brand: 'Apple',
          inventory: 10,
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
          seller: seller._id,
          rating: 4.8,
          numReviews: 64,
        },
        {
          name: 'boAt Airdopes 141',
          description: 'Wireless ear buds with massive playback time, noise cancellation, water resistance and sleek box.',
          price: 1299,
          discount: 15,
          category: 'Headphones',
          brand: 'boAt',
          inventory: 50,
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
          seller: seller._id,
          rating: 4.2,
          numReviews: 43,
        },
        {
          name: 'Canon EOS 200D II',
          description: 'A super lightweight DSLR camera with guide features, articulating touchscreen and 4K recording.',
          price: 45990,
          discount: 12,
          category: 'Cameras',
          brand: 'Canon',
          inventory: 8,
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
          seller: seller._id,
          rating: 4.4,
          numReviews: 36,
        },
        {
          name: 'Wireless Headphones',
          description: 'Affordable wireless Bluetooth headphones with deep bass and responsive controls.',
          price: 2999,
          discount: 50,
          category: 'Headphones',
          brand: 'Sony',
          inventory: 30,
          imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
          seller: seller._id,
          rating: 4.1,
          numReviews: 29,
        },
        {
          name: 'Smart Watch',
          description: 'Elegant fitness and health tracking smart watch with customizable dials and heart monitor.',
          price: 4999,
          discount: 40,
          category: 'Wearables',
          brand: 'Samsung',
          inventory: 40,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          seller: seller._id,
          rating: 4.5,
          numReviews: 50,
        },
        {
          name: 'Backpack',
          description: 'Water resistant multi-compartment travel and school backpack with laptop sleeve.',
          price: 1499,
          discount: 40,
          category: 'Accessories',
          brand: 'boAt',
          inventory: 60,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
          seller: seller._id,
          rating: 4.3,
          numReviews: 18,
        },
        {
          name: 'Running Shoes',
          description: 'Flexible, lightweight athletic shoes designed for comfort and durability.',
          price: 2999,
          discount: 40,
          category: 'Fashion',
          brand: 'OnePlus',
          inventory: 35,
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
          seller: seller._id,
          rating: 4.4,
          numReviews: 25,
        },
      ];

      await Product.insertMany(products);
      console.log('Seeded initial mockup product assets successfully.');
    }
  } catch (error) {
    console.error('Failed to seed products:', error);
  }
};

module.exports = seedProducts;
