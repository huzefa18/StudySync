const express = require('express');
const router = express.Router();
const { askQuestion, getChatHistory, clearChatHistory } = require('../controllers/chatController');

router.post('/ask', askQuestion);
router.get('/history/:sessionId', getChatHistory);
router.delete('/history/:sessionId', clearChatHistory);

module.exports = router;
