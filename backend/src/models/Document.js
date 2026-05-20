const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    required: true,
    default: 'application/pdf'
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  // NEW: Track extraction failures
  extractionError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema);