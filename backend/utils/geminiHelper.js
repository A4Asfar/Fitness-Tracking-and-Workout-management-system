const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { APP_NAME, AI_COACH_NAME, AI_GREETING } = require('../constants/brand');

class GeminiError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

let FITNESS_SYSTEM_PROMPT = '';
let loadedPath = '';
const possiblePaths = [
  path.join(__dirname, '../../.agents/AGENTS.md'),
  path.join(__dirname, '../config/AGENTS.md'),
  path.join(__dirname, './AGENTS.md'),
  path.join(process.cwd(), '.agents/AGENTS.md'),
  path.join(process.cwd(), 'backend/config/AGENTS.md'),
  path.join(process.cwd(), 'AGENTS.md')
];

for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      FITNESS_SYSTEM_PROMPT = fs.readFileSync(p, 'utf8');
      loadedPath = p;
      break;
    }
  } catch (err) {
    // continue to next path
  }
}

if (!FITNESS_SYSTEM_PROMPT) {
  console.error('Failed to read AGENTS.md from any known path, using fallback.');
  FITNESS_SYSTEM_PROMPT = `# ${APP_NAME} - System Persona & Workout Guidelines`;
} else {
  console.log(`📝 Loaded ${AI_COACH_NAME} system prompt from: ${loadedPath}`);
}

FITNESS_SYSTEM_PROMPT = `IMPORTANT:\nEvery response MUST begin with:\n${AI_GREETING}\n\n` + FITNESS_SYSTEM_PROMPT;

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

let selectedModel = 'gemini-2.0-flash'; // default fallback as requested by test-gemini route
let availableModels = [];
let activeModels = []; // intersection
let isConfigured = false;
let startupResult = null;

// Circuit Breaker State
let circuitBreakerState = 'CLOSED'; // 'CLOSED', 'OPEN'
let openedAt = null;
let failureCount = 0;
let lastError = null;
let lastSuccessfulModel = null;

function scrubSensitiveData(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/key=[a-zA-Z0-9_-]+/gi, 'key=[REDACTED]')
    .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"[REDACTED]"')
    .replace(/"token"\s*:\s*"[^"]*"/gi, '"token":"[REDACTED]"');
}

async function runHealthCheck() {
  const modelsToTry = activeModels.length > 0 ? activeModels : PREFERRED_MODELS;
  const healthCheckModel = modelsToTry[0];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000); // 5s timeout for health check

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: healthCheckModel });
    await model.generateContent('Say OK', { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[Health Check] Failed on model ${healthCheckModel}: ${scrubSensitiveData(err.message)}`);
    return false;
  }
}

async function checkCircuitBreaker() {
  if (circuitBreakerState === 'OPEN') {
    const elapsed = Date.now() - openedAt;
    if (elapsed < 60000) {
      console.warn(`🛡️ Circuit breaker is OPEN. Failsafe active. Remaining: ${Math.round((60000 - elapsed) / 1000)}s`);
      throw new Error("AI service is temporarily busy. Please try again shortly.");
    } else {
      console.log('🔄 Circuit breaker is HALF-OPEN. Running recovery health check...');
      const healthy = await runHealthCheck();
      if (healthy) {
        circuitBreakerState = 'CLOSED';
        failureCount = 0;
        console.log('✅ Circuit breaker CLOSED. Health check passed. Service recovered.');
      } else {
        openedAt = Date.now(); // Extend for another 60 seconds
        failureCount++;
        console.warn('❌ Circuit breaker remains OPEN. Health check failed.');
        throw new Error("AI service is temporarily busy. Please try again shortly.");
      }
    }
  }
}

async function generateContentWithFallback(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('⚠️ GEMINI_API_KEY is not set or placeholder.');
    throw new GeminiError('AI service is not configured. Please set GEMINI_API_KEY.', 503);
  }

  const wasCircuitActive = (circuitBreakerState === 'OPEN');
  await checkCircuitBreaker();

  const modelsToTry = activeModels.length > 0 ? activeModels : PREFERRED_MODELS;
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastErr = null;
  let totalAttempts = 0;
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7).toUpperCase();

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    console.log(`[Req: ${requestId}] Trying Gemini model: ${modelName}`);

    let attempt = 1;
    const maxAttempts = 2;

    while (attempt <= maxAttempts) {
      totalAttempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 20000);

      try {
        const modelConfig = {
          model: modelName,
          systemInstruction: FITNESS_SYSTEM_PROMPT,
          ...options
        };

        const model = genAI.getGenerativeModel(modelConfig);
        const generationResult = await model.generateContent(prompt, { signal: controller.signal });
        clearTimeout(timeoutId);

        const responseText = generationResult.response.text();
        if (!responseText) {
          throw new Error('Empty response from Gemini');
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(JSON.stringify({
          logType: 'GEMINI_SUCCESS',
          requestId,
          currentModel: modelName,
          retryCount: attempt - 1,
          switchingToFallback: i > 0,
          finalSelectedModel: modelName,
          circuitBreakerState,
          finalHttpStatus: 200,
          responseTime: `${duration}ms`
        }));

        lastSuccessfulModel = modelName;

        return {
          text: responseText,
          modelUsed: modelName,
          attempts: totalAttempts,
          responseTime: duration,
          fallbackUsed: i > 0,
          response: {
            text: () => responseText
          }
        };

      } catch (error) {
        clearTimeout(timeoutId);
        lastErr = error;

        let status = error.status || error.statusCode;
        let code = error.code;
        let message = error.message || '';

        if (controller.signal.aborted || error.name === 'AbortError' || message.includes('abort')) {
          code = 'ETIMEDOUT';
          status = 503;
          message = 'Gemini request timed out after 20 seconds';
        }

        console.log(`Model failed: ${modelName}`);

        const isQuotaError = /exhausted|quota|limit|429/i.test(message);

        const isRetryable =
          isQuotaError ||
          (status && [429, 500, 502, 503, 504].includes(Number(status))) ||
          (code && ['ETIMEDOUT', 'ECONNRESET', 'ECONNABORTED'].includes(code)) ||
          /\b(429|500|502|503|504|ETIMEDOUT|ECONNRESET|ECONNABORTED)\b/i.test(message) ||
          /timeout/i.test(message);

        console.log(JSON.stringify({
          logType: 'GEMINI_ATTEMPT_FAILED',
          requestId,
          currentModel: modelName,
          retryCount: attempt - 1,
          switchingToFallback: i < modelsToTry.length - 1,
          circuitBreakerState,
          finalHttpStatus: status || 500,
          error: scrubSensitiveData(message)
        }));

        if (!isRetryable) {
          console.error(`[Req: ${requestId}] Non-retryable error (${status || code}): ${scrubSensitiveData(message)}. Failing immediately.`);
          throw new GeminiError("AI service is temporarily busy. Please try again shortly.", 503);
        }

        // If it is a quota error, do NOT retry on same model; immediately fallback to save quota.
        if (isQuotaError) {
          console.log(`[Req: ${requestId}] Quota exceeded on model: ${modelName}. Switching immediately to next fallback.`);
          if (i < modelsToTry.length - 1) {
            console.log(JSON.stringify({
              logType: 'GEMINI_SWITCH_FALLBACK',
              requestId,
              fromModel: modelName,
              toModel: modelsToTry[i + 1],
              reason: 'Quota Exceeded',
              circuitBreakerState
            }));
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          break; // move to the next model in the outer loop
        }

        if (attempt === 1) {
          console.log('Retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempt++;
        } else {
          // Second attempt failed on this model. Wait 2 seconds and switch
          if (i < modelsToTry.length - 1) {
            console.log(JSON.stringify({
              logType: 'GEMINI_SWITCH_FALLBACK',
              requestId,
              fromModel: modelName,
              toModel: modelsToTry[i + 1],
              reason: 'Retry limit reached',
              circuitBreakerState
            }));
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          break;
        }
      }
    }
  }

  console.log('All Gemini models failed.');
  circuitBreakerState = 'OPEN';
  openedAt = Date.now();
  failureCount = (failureCount || 0) + 1;
  lastError = lastErr;

  console.log(JSON.stringify({
    logType: 'GEMINI_ALL_MODELS_FAILED',
    requestId,
    circuitBreakerState,
    status: 503
  }));

  throw new GeminiError("AI service is temporarily busy. Please try again shortly.", 503);
}

async function generateChatWithFallback(history, message, userProfile = null) {
  let fullPrompt = "";
  if (userProfile) {
    fullPrompt += "USER PROFILE DETAILS:\n";
    fullPrompt += `- Name: ${userProfile.name || 'User'}\n`;
    if (userProfile.weight) fullPrompt += `- Weight: ${userProfile.weight} kg\n`;
    if (userProfile.height) fullPrompt += `- Height: ${userProfile.height} cm\n`;
    if (userProfile.fitnessGoal && userProfile.fitnessGoal !== 'None') {
      fullPrompt += `- Fitness Goal: ${userProfile.fitnessGoal}\n`;
    }
    if (userProfile.trainingLevel) fullPrompt += `- Experience/Training Level: ${userProfile.trainingLevel}\n`;
    
    // Calculate BMI if height and weight exist
    if (userProfile.weight && userProfile.height) {
      const heightInMeters = userProfile.height / 100;
      const bmi = (userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
      fullPrompt += `- BMI: ${bmi}\n`;
    }
    fullPrompt += "\n";
  }

  if (history && history.length > 0) {
    fullPrompt += "CONVERSATION HISTORY:\n";
    history.forEach(msg => {
      const roleName = msg.role === 'ai' ? AI_COACH_NAME : 'User';
      fullPrompt += `${roleName}: ${msg.text}\n`;
    });
    fullPrompt += "\n";
  }
  fullPrompt += `CURRENT USER QUESTION:\n${message}\n\n${AI_COACH_NAME} Response:`;

  return await generateContentWithFallback(fullPrompt);
}

function logDiagnostics() {
  let sdkVersion = 'unknown';
  try {
    sdkVersion = require('@google/generative-ai/package.json').version;
  } catch (e) {
    try {
      sdkVersion = require('../package.json').dependencies['@google/generative-ai'];
    } catch (e2) {}
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const keyStatus = (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') ? 'NOT CONFIGURED' : 'CONFIGURED';

  console.log('\n=========================================');
  console.log(`🔌 Gemini SDK version: ${sdkVersion}`);
  console.log(`🔑 Configured API Key status: ${keyStatus}`);
  console.log(`🎯 Selected model: ${selectedModel}`);
  console.log(`📊 Available models: ${availableModels.join(', ') || 'None discovered'}`);
  console.log(`🛡️ Circuit breaker state: ${circuitBreakerState}`);
  console.log(`🟢 Gemini availability: ${isConfigured ? 'AVAILABLE' : 'UNAVAILABLE'}`);
  console.log(`📂 System Prompt Path: ${loadedPath ? path.resolve(loadedPath) : 'Fallback (Memory)'}`);
  console.log(`📏 System Prompt Length: ${FITNESS_SYSTEM_PROMPT.length} characters`);
  console.log('--- System Prompt (First 300 Characters) ---');
  console.log(FITNESS_SYSTEM_PROMPT.substring(0, 300));
  console.log('--- System Prompt (Last 300 Characters) ---');
  console.log(FITNESS_SYSTEM_PROMPT.substring(Math.max(0, FITNESS_SYSTEM_PROMPT.length - 300)));
  console.log('=========================================\n');
}

async function verifyGeminiSetup() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ GEMINI_API_KEY is not configured or is placeholder. Gemini operations will use local fallbacks.');
    startupResult = { success: false, reason: 'Key not configured' };
    logDiagnostics();
    return startupResult;
  }

  try {
    console.log('🤖 Discovering available Gemini models...');
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
      
      console.log('📊 Discovered available Gemini models:', availableModels.join(', '));

      activeModels = PREFERRED_MODELS.filter(m => availableModels.includes(m));
      console.log('🎯 Active model list after discovery & filtering:', activeModels.join(', '));
      
      const modelsToTry = activeModels.length > 0 ? activeModels : PREFERRED_MODELS;
      const candidate = modelsToTry[0];
      console.log(`💬 Configuring primary model candidate: ${candidate} via metadata...`);
      
      selectedModel = candidate;
      isConfigured = true;
      startupResult = { 
        success: true, 
        selectedModel, 
        availableModels, 
        testResponse: 'SKIPPED (Metadata verified to optimize quota)' 
      };
      console.log(`✅ Model ${candidate} configured successfully via metadata verification (generateContent test call skipped to optimize quota).`);
    }
    logDiagnostics();
    return startupResult;
  } catch (error) {
    console.error('❌ Gemini initialization test failed:', scrubSensitiveData(error.message));
    startupResult = { success: false, error: error.message, availableModels };
    logDiagnostics();
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

function getAvailableModels() {
  return availableModels;
}

module.exports = {
  verifyGeminiSetup,
  getSelectedModel,
  isGeminiReady,
  getStartupResult,
  getAvailableModels,
  generateContentWithFallback,
  generateChatWithFallback
};
