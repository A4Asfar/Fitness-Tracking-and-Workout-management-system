const express = require('express');
const { auth, premium } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();


// ─── Gemini AI Chat Routes (Premium only) ───
router.post('/ai', auth, premium, chatController.aiChat);
router.get('/ai/conversations', auth, premium, chatController.getConversations);
router.post('/ai/new', auth, premium, chatController.newConversation);
router.get('/ai/:chatId', auth, premium, chatController.getAiChatHistory);
router.put('/ai/:chatId/rename', auth, premium, chatController.renameConversation);
router.delete('/ai/:chatId', auth, premium, chatController.deleteConversation);

module.exports = router;

