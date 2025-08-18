const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get sales analytics and stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get orders for the period
    const orders = await Order.find({
      storeId: store._id,
      createdAt: { $gte: startDate },
      status: 'completed'
    });

    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get all orders count by status
    const ordersByStatus = await Order.aggregate([
      { $match: { storeId: store._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total products count
    const totalProducts = await Product.countDocuments({ storeId: store._id });
    const activeProducts = await Product.countDocuments({ 
      storeId: store._id, 
      status: 'active' 
    });

    res.json({
      period,
      dateRange: { startDate, endDate: now },
      sales: {
        totalSales,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get top-selling products
router.get('/products', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const limit = parseInt(req.query.limit) || 10;

    // Aggregate top-selling products
    const topProducts = await Order.aggregate([
      { $match: { storeId: store._id, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          category: '$product.category',
          price: '$product.price',
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({ topProducts });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent orders summary
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.find({ storeId: store._id })
      .select('customerName customerEmail totalAmount status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ recentOrders });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sales chart data
router.get('/sales-chart', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const { period = 'month' } = req.query;
    
    // Calculate date range and grouping
    const now = new Date();
    let startDate, groupBy;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt"
          }
        };
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          storeId: store._id,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ salesData, period });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
