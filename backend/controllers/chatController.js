const Chat = require('../models/Chat');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getSelectedModel } = require('../utils/geminiHelper');

// ─── FITNESS COACH SYSTEM PROMPT ───
const FITNESS_SYSTEM_PROMPT = `You are FitAI, an expert fitness coach.

Specialties:
* Weight Loss
* Muscle Gain
* Strength Training
* Nutrition Planning
* BMI Analysis
* Calorie Estimation
* Home Workouts
* Gym Workouts
* Fitness Motivation

Rules:
* Keep responses concise.
* Use bullet points where appropriate.
* Give actionable fitness advice.
* Personalize using available profile data.
* Avoid medical diagnosis.
* Redirect dangerous health questions to healthcare professionals.`;

// ─── GEMINI AI CHAT ───

/**
 * POST /api/chat/ai
 * Send a message in a conversation. Creates a new conversation if no chatId provided.
 */
exports.aiChat = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const userId = req.userId;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  // Find existing conversation or create new one
  let chat;
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      res.status(404);
      throw new Error('Conversation not found');
    }
    // Auto-title from first message if still default
    if (chat.title === 'New Chat' && chat.messages.length === 0) {
      chat.title = message.length > 40 ? message.substring(0, 40) + '...' : message;
    }
  } else {
    // Create new conversation with title from first message
    const title = message.length > 40 ? message.substring(0, 40) + '...' : message;
    chat = new Chat({ userId, title, messages: [] });
  }

  // Build context from conversation history (last 10 messages for context window)
  const contextMessages = chat.messages.slice(-10);

  // Check for Gemini API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('⚠️ GEMINI_API_KEY is not set or placeholder.');
    res.status(500);
    throw new Error('AI service is not configured. Please set GEMINI_API_KEY.');
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = getSelectedModel();
    console.log(`🤖 Generating content using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Build a single prompt string containing system prompt, history context, and current message
    let fullPrompt = `${FITNESS_SYSTEM_PROMPT}\n\n`;
    
    if (contextMessages.length > 0) {
      fullPrompt += "CONVERSATION HISTORY:\n";
      contextMessages.forEach(msg => {
        const roleName = msg.role === 'ai' ? 'FitAI' : 'User';
        fullPrompt += `${roleName}: ${msg.text}\n`;
      });
      fullPrompt += "\n";
    }
    
    fullPrompt += `CURRENT USER QUESTION:\n${message}\n\nFitAI Response:`;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();

    if (!reply) {
      throw new Error('Empty response from Gemini');
    }

    // Save both messages to database
    chat.messages.push({ role: 'user', text: message });
    chat.messages.push({ role: 'ai', text: reply });
    chat.lastMessageAt = new Date();
    await chat.save();

    console.log('✅ Gemini response saved for user:', userId, '| Chat:', chat._id);

    res.status(200).json({
      reply,
      chatId: chat._id,
      title: chat.title,
    });
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get AI response: ' + error.message,
      error: {
        message: error.message,
        status: error.status,
        details: error.details
      }
    });
  }
});

/**
 * GET /api/chat/ai/conversations
 * Get all conversations for the authenticated user
 */
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Chat.find({ userId: req.userId })
    .select('title lastMessageAt messages')
    .sort({ lastMessageAt: -1 })
    .lean();

  // Add preview (last message text) and message count
  const result = conversations.map(conv => {
    const lastMsg = conv.messages && conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;
    return {
      _id: conv._id,
      title: conv.title,
      lastMessageAt: conv.lastMessageAt,
      preview: lastMsg ? (lastMsg.text.length > 60 ? lastMsg.text.substring(0, 60) + '...' : lastMsg.text) : 'No messages yet',
      messageCount: conv.messages ? conv.messages.length : 0,
    };
  });

  res.json(result);
});

/**
 * GET /api/chat/ai/:chatId
 * Get all messages for a specific conversation
 */
exports.getAiChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) {
    return res.json([]);
  }

  res.json({
    _id: chat._id,
    title: chat.title,
    messages: chat.messages,
  });
});

/**
 * POST /api/chat/ai/new
 * Create a new empty conversation
 */
exports.newConversation = asyncHandler(async (req, res) => {
  const chat = new Chat({
    userId: req.userId,
    title: 'New Chat',
    messages: [],
  });
  await chat.save();

  res.status(201).json({
    _id: chat._id,
    title: chat.title,
    lastMessageAt: chat.lastMessageAt,
    preview: 'No messages yet',
    messageCount: 0,
  });
});

/**
 * PUT /api/chat/ai/:chatId/rename
 * Rename a conversation
 */
exports.renameConversation = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Please provide a title');
  }

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: req.userId },
    { title: title.trim() },
    { new: true }
  );

  if (!chat) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  res.json({ _id: chat._id, title: chat.title });
});

/**
 * DELETE /api/chat/ai/:chatId
 * Delete a conversation
 */
exports.deleteConversation = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOneAndDelete({ _id: chatId, userId: req.userId });
  if (!chat) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  console.log('🗑️ Conversation deleted:', chatId, 'for user:', req.userId);
  res.json({ message: 'Conversation deleted' });
});
