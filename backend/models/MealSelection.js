const mongoose = require('mongoose');

const mealSelectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true,
  },
  selectedMeal: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    default: 0,
  },
  protein: {
    type: Number,
    default: 0,
  },
  carbs: {
    type: Number,
    default: 0,
  },
  fats: {
    type: Number,
    default: 0,
  },
  selectedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MealSelection', mealSelectionSchema);
