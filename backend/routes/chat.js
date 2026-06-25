const express = require('express');
const { auth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();


// ─── Gemini AI Chat Routes (all protected with auth) ───
router.post('/ai', auth, chatController.aiChat);
router.get('/ai/conversations', auth, chatController.getConversations);
router.post('/ai/new', auth, chatController.newConversation);
router.get('/ai/:chatId', auth, chatController.getAiChatHistory);
router.put('/ai/:chatId/rename', auth, chatController.renameConversation);
router.delete('/ai/:chatId', auth, chatController.deleteConversation);

module.exports = router;
