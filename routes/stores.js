const express = require('express');
const Joi = require('joi');
const Store = require('../models/Store');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schema
const storeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow(''),
  logo: Joi.string().uri().allow(''),
  banner: Joi.string().uri().allow(''),
  socialLinks: Joi.object({
    facebook: Joi.string().uri().allow(''),
    twitter: Joi.string().uri().allow(''),
    instagram: Joi.string().uri().allow(''),
    linkedin: Joi.string().uri().allow(''),
    website: Joi.string().uri().allow('')
  }).optional()
});

// Create a store
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error } = storeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if vendor already has a store
    const existingStore = await Store.findOne({ vendorId: req.vendor._id });
    if (existingStore) {
      return res.status(400).json({ error: 'Vendor already has a store' });
    }

    const store = new Store({
      ...req.body,
      vendorId: req.vendor._id
    });

    await store.save();

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get store details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const store = await Store.findOne({ 
      _id: req.params.id, 
      vendorId: req.vendor._id 
    }).populate('vendorId', 'name email');

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update store
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = storeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.vendor._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({
      message: 'Store updated successfully',
      store
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's store
router.get('/', authMiddleware, async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.vendor._id });
    
    if (!store) {
      return res.status(404).json({ error: 'No store found for this vendor' });
    }

    res.json({ store });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
