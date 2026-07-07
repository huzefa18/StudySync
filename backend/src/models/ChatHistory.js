const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  sources: [{ document: String, chunkIndex: Number, relevance: String }],
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  documentName: { type: String },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
