const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Vendor = require('../models/Vendor');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register vendor
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message, 400);
    }

    const { name, email, password } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.error('Vendor already exists with this email', 409);
    }

    // Create new vendor
    const vendor = new Vendor({ name, email, password });
    await vendor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: vendor._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Longer expiry for mobile
    );

    res.success({
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status
      }
    }, 'Vendor registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    res.error('Server error', 500);
  }
});

// Login vendor
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: vendor._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current vendor
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    vendor: {
      id: req.vendor._id,
      name: req.vendor.name,
      email: req.vendor.email,
      status: req.vendor.status,
      createdAt: req.vendor.createdAt
    }
  });
});

module.exports = router;
