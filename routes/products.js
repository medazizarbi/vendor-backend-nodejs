const express = require('express');
const Joi = require('joi');
const Product = require('../models/Product');
const Store = require('../models/Store');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()),
  category: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive', 'out_of_stock')
});

// Add a new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store to add products' });
    }

    const product = new Product({
      ...req.body,
      storeId: store._id
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List all products with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status;

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    // Build query
    const query = { storeId: store._id };
    if (category) query.category = category;
    if (status) query.status = status;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

// Get product details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const product = await Product.findOne({ 
      _id: req.params.id, 
      storeId: store._id 
    }).populate('storeId', 'name');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, storeId: store._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Get vendor's store
    const store = await Store.findOne({ vendorId: req.vendor._id });
    if (!store) {
      return res.status(400).json({ error: 'Vendor must have a store' });
    }

    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      storeId: store._id 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
