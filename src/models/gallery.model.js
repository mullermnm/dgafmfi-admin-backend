const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  }
});

const gallerySchema = new mongoose.Schema({
  images: [imageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
