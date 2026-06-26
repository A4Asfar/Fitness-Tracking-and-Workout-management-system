require('dotenv').config();
const { generateContentWithFallback } = require('../utils/geminiHelper');

async function run() {
  try {
    const result = await generateContentWithFallback('Say OK');
    console.log('Gemini Response:', result.text);
    console.log('Model Used:', result.modelUsed);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
