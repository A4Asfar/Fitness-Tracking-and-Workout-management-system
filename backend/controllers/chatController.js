const ChatHistory = require('../models/ChatHistory');
const ChatKnowledge = require('../models/ChatKnowledge');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.logChatMessage = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    res.status(400);
    throw new Error('Please provide a question');
  }

  const q = question.toLowerCase();
  
  // Find matching knowledge base entry
  const knowledgeBase = await ChatKnowledge.find({});
  let matchedCategory = knowledgeBase.find(item => 
    item.keywords.some(k => q.includes(k.toLowerCase()))
  );

  // Fallback to general if no match
  if (!matchedCategory) {
    matchedCategory = await ChatKnowledge.findOne({ category: 'general' });
  }

  const responses = matchedCategory?.responses || ["I'm still learning about that. Try asking about workouts, nutrition, or recovery!"];
  const aiResponse = responses[Math.floor(Math.random() * responses.length)];

  const chat = await ChatHistory.create({
    userId: req.userId,
    question,
    response: aiResponse,
  });

  console.log('🤖 AI Chat processed and saved to MongoDB for user:', req.userId);
  res.status(201).json(chat);
});

exports.getChatHistory = asyncHandler(async (req, res) => {
  const history = await ChatHistory.find({ userId: req.userId }).sort({ timestamp: -1 });
  res.json(history);
});
