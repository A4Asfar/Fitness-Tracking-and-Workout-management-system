require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('⚠️ GEMINI_API_KEY is not configured with a real key in local .env. Cannot run live API call.');
    process.exit(0);
  }

  try {
    console.log('🤖 Initializing GoogleGenerativeAI with key:', apiKey.substring(0, 5) + '...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We pass systemInstruction inside model parameters (config), which is correct for @google/generative-ai
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: FITNESS_SYSTEM_PROMPT
    });

    console.log('💬 Starting chat session...');
    const chatSession = model.startChat({
      history: []
    });

    const query = 'plan for strength';
    console.log(`✉️ Sending message: "${query}"`);
    const result = await chatSession.sendMessage(query);
    const text = result.response.text();
    
    console.log('\n🤖 RESPONSE FROM GEMINI:');
    console.log('--------------------------------------------------');
    console.log(text);
    console.log('--------------------------------------------------');
    
    console.log('\n✅ TEST PASSED: Real Gemini response received successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gemini Error:', err.message);
    process.exit(1);
  }
}

run();
