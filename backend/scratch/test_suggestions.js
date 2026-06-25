require('dotenv').config();
const mongoose = require('mongoose');
const { getNutritionSuggestions } = require('../controllers/contentController');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const req = {
      query: { goal: 'None' }
    };
    
    const res = {
      status: function(code) {
        console.log('Status code:', code);
        return this;
      },
      json: function(data) {
        console.log('Returned data size:', data.length);
        console.log('Returned data (first 3):', data.slice(0, 3));
        return this;
      }
    };

    await getNutritionSuggestions(req, res);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
