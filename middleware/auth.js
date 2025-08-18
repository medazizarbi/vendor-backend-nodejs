const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const vendor = await Vendor.findById(decoded.id);
    
    if (!vendor) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
