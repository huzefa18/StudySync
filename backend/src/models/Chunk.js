const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  vector: {
    type: [Number],
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Chunk', ChunkSchema);
