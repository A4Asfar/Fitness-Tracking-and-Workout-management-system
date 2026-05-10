const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  carbs: {
    type: Number,
    required: true,
  },
  fats: {
    type: Number,
    required: true,
  },
  recommendedFor: {
    type: String,
    required: true,
  },
  benefit: {
    type: String,
  },
  icon: {
    type: String,
    default: 'Apple',
  }
});

module.exports = mongoose.model('Meal', mealSchema);
