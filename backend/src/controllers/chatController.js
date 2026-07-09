const { findRelevantChunks } = require('../../services/search');
const { generateAnswer } = require('../../services/geminiQA');
const ChatHistory = require('../models/ChatHistory');

const askQuestion = async (req, res) => {
  const { question, sessionId, documentId, documentName } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ success: false, message: 'question is required' });
  }

  try {
    let session = null;

    if (sessionId) {
      session = await ChatHistory.findOne({ sessionId });
    }

    if (!session) {
      session = new ChatHistory({
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        documentId: documentId || null,
        documentName: documentName || null,
        messages: []
      });
    }

    const recentHistory = session.messages.slice(-6);

    const relevantChunks = await findRelevantChunks(question, 5, documentId);

    if (relevantChunks.length === 0) {
      return res.status(200).json({
        success: true,
        answer: "I couldn't find relevant content in your uploaded documents to answer that. Try uploading more materials.",
        sources: [],
        sessionId: session.sessionId
      });
    }

    const answer = await generateAnswer(question, relevantChunks, recentHistory);

    const sources = relevantChunks.map(chunk => ({
      document: chunk.metadata.documentName,
      chunkIndex: chunk.metadata.chunkIndex,
      relevance: Math.max(0, (1 - chunk.distance)).toFixed(2)
    }));

    session.messages.push({ role: 'user', text: question });
    session.messages.push({ role: 'ai', text: answer, sources });
    await session.save();

    res.status(200).json({
      success: true,
      answer,
      sources,
      sessionId: session.sessionId
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate answer',
      error: err.message
    });
  }
};

const getChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await ChatHistory.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: err.message });
  }
};

const clearChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await ChatHistory.findOneAndDelete({ sessionId });
    res.status(200).json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing history', error: err.message });
  }
};

module.exports = { askQuestion, getChatHistory, clearChatHistory };
