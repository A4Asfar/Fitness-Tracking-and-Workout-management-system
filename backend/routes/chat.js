const express = require('express');
const { auth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/', auth, chatController.logChatMessage);
router.get('/', auth, chatController.getChatHistory);

module.exports = router;
