// const axios = require('axios');
// require('dotenv').config();

const path = require('path');

async function testInsights() {
  console.log('🔍 Testing AI Insights Route...');
  try {
    // Correcting the path to the controller
    const workoutController = require('../controllers/workoutController');
    console.log('✅ workoutController found');
    if (workoutController.getHomeInsights) {
        console.log('✅ getHomeInsights exists in controller');
    } else {
        console.error('❌ getHomeInsights MISSING from controller');
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testInsights();
