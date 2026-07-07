// Set mock environment before requiring anything
process.env.GEMINI_API_KEY = 'mock_api_key_for_testing';

const Module = require('module');

// Global mock state
const mockState = {
  failAll: false
};

// Mock SDK
const mockSDK = {
  GoogleGenerativeAI: class {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
    getGenerativeModel(params) {
      const modelName = params.model;
      return {
        generateContent: async (prompt, options) => {
          // Simulate 429 error if configured or if it's the primary model
          if (mockState.failAll || modelName === 'gemini-2.5-flash') {
            console.log(`[Mock SDK] Simulating 429 Quota Exceeded for ${modelName}`);
            const err = new Error('Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests');
            err.status = 429;
            throw err;
          }

          // If fallback model, succeed
          console.log(`[Mock SDK] Succeeding for fallback model: ${modelName}`);
          return {
            response: {
              text: () => `Response from fallback model ${modelName}`
            }
          };
        }
      };
    }
  }
};

// Intercept require
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === '@google/generative-ai') {
    return mockSDK;
  }
  return originalRequire.apply(this, arguments);
};

const { generateContentWithFallback, verifyGeminiSetup } = require('../utils/geminiHelper');

async function testFailover() {
  console.log('🧪 Test 1: Testing 429 Quota Exceeded Failover...');
  
  // Set up active models for test (to match preferred list)
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        models: [
          { name: "models/gemini-2.5-flash", supportedGenerationMethods: ["generateContent"] },
          { name: "models/gemini-2.0-flash", supportedGenerationMethods: ["generateContent"] }
        ]
      })
    };
  };

  await verifyGeminiSetup();

  try {
    const result = await generateContentWithFallback('Say hello');
    console.log('Result text:', result.text);
    console.log('Model used:', result.modelUsed);
    console.log('Fallback used:', result.fallbackUsed);
    
    if (result.modelUsed === 'gemini-2.0-flash' && result.fallbackUsed === true) {
      console.log('✅ Test 1 Passed: Successfully failed over from gemini-2.5-flash (429) to gemini-2.0-flash!');
    } else {
      console.error('❌ Test 1 Failed: Fallback was not used or incorrect model selected');
    }
  } catch (err) {
    console.error('❌ Test 1 Failed with error:', err.message);
  }

  console.log('\n🧪 Test 2: Testing all models failing (429)...');
  // Configure mock state to fail all models
  mockState.failAll = true;

  try {
    await generateContentWithFallback('Say hello');
    console.error('❌ Test 2 Failed: Did not throw an error when all models failed.');
  } catch (err) {
    console.log('Caught expected error:', err.message);
    console.log('Error status:', err.status);
    console.log('Error name:', err.name);
    
    if (err.name === 'GeminiError' && err.status === 503 && err.message === 'AI service is temporarily busy. Please try again shortly.') {
      console.log('✅ Test 2 Passed: Correctly threw GeminiError with 503 and friendly message!');
    } else {
      console.error('❌ Test 2 Failed: Incorrect error formatting or message');
    }
  }

  // Restore fetch
  global.fetch = originalFetch;
}

testFailover().catch(console.error);
