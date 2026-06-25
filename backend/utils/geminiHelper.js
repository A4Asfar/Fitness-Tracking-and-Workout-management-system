const { GoogleGenerativeAI } = require('@google/generative-ai');

let selectedModel = 'gemini-2.0-flash'; // default fallback as requested by test-gemini route
let availableModels = [];
let isConfigured = false;

/**
 * Discovers available models for the configured GEMINI_API_KEY,
 * selects the best compatible model, and verifies connectivity.
 */
async function verifyGeminiSetup() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ GEMINI_API_KEY is not configured or is placeholder. Gemini operations will use local fallbacks.');
    return { success: false, reason: 'Key not configured' };
  }

  try {
    console.log('🤖 Discovering available Gemini models...');
    // Query list of models from REST endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list models from Gemini API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.models && Array.isArray(data.models)) {
      availableModels = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      
      console.log('📊 Available Gemini models for this key:', availableModels.join(', '));

      // Prioritized list of candidates to select
      const candidates = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-pro'
      ];

      let found = false;
      for (const candidate of candidates) {
        if (availableModels.includes(candidate)) {
          selectedModel = candidate;
          found = true;
          break;
        }
      }

      if (!found && availableModels.length > 0) {
        // Fallback to the first available model that supports generation
        selectedModel = availableModels[0];
      }
    }

    console.log(`🎯 Selected Gemini Model: ${selectedModel}`);

    // Verify model works by initializing and sending a test message
    console.log('💬 Running Gemini initialization test...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: selectedModel });
    
    // Test content generation
    const testResult = await model.generateContent('Say OK');
    const text = testResult.response.text().trim();
    console.log(`✅ Gemini initialization test succeeded. Response: "${text}"`);
    isConfigured = true;
    return { success: true, selectedModel, availableModels };
  } catch (error) {
    console.error('❌ Gemini initialization test failed:', error.message);
    return { success: false, error: error.message, status: error.status, details: error.details };
  }
}

function getSelectedModel() {
  return selectedModel;
}

function isGeminiReady() {
  return isConfigured;
}

module.exports = {
  verifyGeminiSetup,
  getSelectedModel,
  isGeminiReady
};
