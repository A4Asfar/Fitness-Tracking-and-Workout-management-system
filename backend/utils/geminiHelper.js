const { GoogleGenerativeAI } = require('@google/generative-ai');

let selectedModel = 'gemini-2.0-flash'; // default fallback as requested by test-gemini route
let availableModels = [];
let isConfigured = false;

let startupResult = null;

/**
 * Discovers available models for the configured GEMINI_API_KEY,
 * selects the best compatible model, and verifies connectivity.
 */
async function verifyGeminiSetup() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ GEMINI_API_KEY is not configured or is placeholder. Gemini operations will use local fallbacks.');
    startupResult = { success: false, reason: 'Key not configured' };
    return startupResult;
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
        'gemini-2.5-flash',
        'gemini-3.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-pro'
      ];

      let success = false;
      let lastError = null;

      for (const candidate of candidates) {
        if (availableModels.includes(candidate)) {
          console.log(`💬 Testing candidate model: ${candidate}...`);
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: candidate });
            
            // Set short timeout or test content generation
            const testResult = await model.generateContent('Say OK');
            const text = testResult.response.text().trim();
            console.log(`✅ Model ${candidate} verified successfully. Response: "${text}"`);
            
            selectedModel = candidate;
            success = true;
            isConfigured = true;
            startupResult = { success: true, selectedModel, availableModels, testResponse: text };
            break;
          } catch (err) {
            console.warn(`⚠️ Model ${candidate} test failed:`, err.message);
            lastError = err;
          }
        }
      }

      if (!success) {
        console.error('❌ All prioritized candidate models failed verification test.');
        const backupModel = candidates.find(c => availableModels.includes(c)) || availableModels[0] || 'gemini-2.0-flash';
        selectedModel = backupModel;
        startupResult = {
          success: false,
          error: lastError ? lastError.message : 'No models available',
          status: lastError ? lastError.status : 500,
          details: lastError ? lastError.details : null,
          selectedModel,
          availableModels
        };
      }
    }
    return startupResult;
  } catch (error) {
    console.error('❌ Gemini initialization test failed:', error.message);
    startupResult = { success: false, error: error.message, status: error.status, details: error.details, availableModels };
    return startupResult;
  }
}

function getSelectedModel() {
  return selectedModel;
}

function isGeminiReady() {
  return isConfigured;
}

function getStartupResult() {
  return startupResult;
}

module.exports = {
  verifyGeminiSetup,
  getSelectedModel,
  isGeminiReady,
  getStartupResult
};
