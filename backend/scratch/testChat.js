require('dotenv').config();
const mongoose = require('mongoose');
const Chat = require('../models/Chat');

async function testMockChat() {
  console.log('🧪 Starting mock Chat flow test...');
  
  // Connect to DB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Database.');

  const testUserId = new mongoose.Types.ObjectId(); // Random temp user
  const message = 'Hello, this is a test user message!';

  // Clean up any existing test chat
  await Chat.deleteOne({ userId: testUserId });

  // Mock Gemini API Response structure
  const mockGeminiResponse = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: 'Hello! This is the mock Gemini AI assistant response. I received your message.'
            }
          ],
          role: 'model'
        }
      }
    ]
  };

  // Mock global fetch to return the successful response
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    console.log('\n=========================================');
    console.log('📡 Intercepted global.fetch call to Gemini:');
    console.log('URL:', url);
    const body = JSON.parse(options.body);
    console.log('Request Contents Payload:\n', JSON.stringify(body.contents, null, 2));
    console.log('=========================================\n');

    return {
      ok: true,
      status: 200,
      json: async () => mockGeminiResponse
    };
  };

  // Temporarily set GEMINI_API_KEY so the controller proceeds
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'mock_api_key';

  try {
    const chatController = require('../controllers/chatController');
    
    // Simulate Express req and res
    const req = {
      body: {
        message,
        userId: testUserId.toString()
      }
    };

    let responseData = null;
    const res = {
      status: (code) => {
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      }
    };

    // Invoke controller
    await chatController.aiChat(req, res);

    console.log('Response from controller:', responseData);

    // Verify Chat document was created in DB
    const chatDoc = await Chat.findOne({ userId: testUserId });
    console.log('\nSaved Chat Document in MongoDB:\n', JSON.stringify(chatDoc, null, 2));

    if (chatDoc && chatDoc.messages.length === 2) {
      console.log('✅ TEST PASSED: User and AI messages saved successfully to MongoDB.');
    } else {
      console.log('❌ TEST FAILED: Messages not saved correctly.');
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    // Restore
    global.fetch = originalFetch;
    process.env.GEMINI_API_KEY = originalKey;
    // Clean up DB
    await Chat.deleteOne({ userId: testUserId });
    await mongoose.disconnect();
    console.log('Disconnected from Database.');
  }
}

testMockChat();
