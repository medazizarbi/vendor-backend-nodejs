const express = require('express');
const Joi = require('joi');
const Order = require('../models/Order');
const OrderNote = require('../models/OrderNote');
const Product = require('../models/Product');
const Store = require('../models/Store');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const orderSchema = Joi.object({
  customerName: Joi.string().required(),
  customerEmail: Joi.string().email().required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    price: Joi.number().min(0).required()
  })).min(1).required()
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').required()
});

const noteSchema = Joi.object({
  content: Joi.string().required()
});

// List all orders with filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    // Build query
    const query = { storeId: store._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.productId', 'name price')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      storeId: store._id 
    }).populate('items.productId', 'name price images');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { error } = statusUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      storeId: store._id 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(req.body.status)) {
      return res.status(400).json({ 
        error: `Cannot change status from ${order.status} to ${req.body.status}` 
      });
    }

    // If order is being completed, decrease product stock
    if (req.body.status === 'completed' && order.status !== 'completed') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    order.status = req.body.status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add order note
router.post('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const { error } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    // Verify order belongs to vendor
    const order = await Order.findOne({ 
      _id: req.params.id, 
      storeId: store._id 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const note = new OrderNote({
      orderId: req.params.id,
      content: req.body.content
    });

    await note.save();

    res.status(201).json({
      message: 'Note added successfully',
      note
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List order notes
router.get('/:id/notes', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    // Verify order belongs to vendor
    const order = await Order.findOne({ 
      _id: req.params.id, 
      storeId: store._id 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const notes = await OrderNote.find({ orderId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order (for testing purposes)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of req.body.items) {
      totalAmount += item.price * item.quantity;
    }

    const order = new Order({
      ...req.body,
      storeId: store._id,
      totalAmount
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
