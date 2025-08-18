const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  banner: {
    type: String
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    website: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
