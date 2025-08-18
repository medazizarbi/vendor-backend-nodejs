const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Vendor = require('./models/Vendor');
const Store = require('./models/Store');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-backend');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Vendor.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create sample vendor
    const hashedPassword = await bcrypt.hash('password123', 12);
    const vendor = new Vendor({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      status: 'active'
    });
    await vendor.save();
    console.log('Created sample vendor');

    // Create sample store
    const store = new Store({
      vendorId: vendor._id,
      name: 'Tech Paradise',
      description: 'Your one-stop shop for all tech gadgets and accessories',
      logo: 'https://example.com/logo.png',
      banner: 'https://example.com/banner.png',
      socialLinks: {
        facebook: 'https://facebook.com/techparadise',
        twitter: 'https://twitter.com/techparadise',
        instagram: 'https://instagram.com/techparadise',
        website: 'https://techparadise.com'
      }
    });
    await store.save();
    console.log('Created sample store');

    // Create sample products
    const products = [
      {
        storeId: store._id,
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        stock: 50,
        category: 'Electronics',
        images: ['https://example.com/headphones1.jpg', 'https://example.com/headphones2.jpg'],
        status: 'active'
      },
      {
        storeId: store._id,
        name: 'Smartphone Case',
        description: 'Protective case for iPhone and Android devices',
        price: 19.99,
        stock: 200,
        category: 'Accessories',
        images: ['https://example.com/case1.jpg'],
        status: 'active'
      },
      {
        storeId: store._id,
        name: 'USB-C Cable',
        description: 'Fast charging USB-C cable - 6ft length',
        price: 12.99,
        stock: 100,
        category: 'Cables',
        images: ['https://example.com/cable1.jpg'],
        status: 'active'
      },
      {
        storeId: store._id,
        name: 'Wireless Charger',
        description: 'Qi-compatible wireless charging pad',
        price: 29.99,
        stock: 0,
        category: 'Accessories',
        images: ['https://example.com/charger1.jpg'],
        status: 'out_of_stock'
      },
      {
        storeId: store._id,
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with excellent sound quality',
        price: 79.99,
        stock: 25,
        category: 'Electronics',
        images: ['https://example.com/speaker1.jpg', 'https://example.com/speaker2.jpg'],
        status: 'active'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Created sample products');

    // Create sample orders
    const orders = [
      {
        storeId: store._id,
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        items: [
          {
            productId: createdProducts[0]._id,
            quantity: 1,
            price: 99.99
          },
          {
            productId: createdProducts[1]._id,
            quantity: 2,
            price: 19.99
          }
        ],
        totalAmount: 139.97,
        status: 'completed'
      },
      {
        storeId: store._id,
        customerName: 'Bob Smith',
        customerEmail: 'bob@example.com',
        items: [
          {
            productId: createdProducts[2]._id,
            quantity: 3,
            price: 12.99
          }
        ],
        totalAmount: 38.97,
        status: 'processing'
      },
      {
        storeId: store._id,
        customerName: 'Carol Williams',
        customerEmail: 'carol@example.com',
        items: [
          {
            productId: createdProducts[4]._id,
            quantity: 1,
            price: 79.99
          },
          {
            productId: createdProducts[1]._id,
            quantity: 1,
            price: 19.99
          }
        ],
        totalAmount: 99.98,
        status: 'pending'
      },
      {
        storeId: store._id,
        customerName: 'David Brown',
        customerEmail: 'david@example.com',
        items: [
          {
            productId: createdProducts[0]._id,
            quantity: 2,
            price: 99.99
          }
        ],
        totalAmount: 199.98,
        status: 'completed'
      }
    ];

    await Order.insertMany(orders);
    console.log('Created sample orders');

    console.log('\n=== Sample Data Created Successfully ===');
    console.log('Vendor credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    console.log('\nYou can now test the API endpoints!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
