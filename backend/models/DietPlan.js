const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: String,
  serving: String,
  quantity: Number
});

const mealSchema = new mongoose.Schema({
  mealName: String,
  foods: [foodSchema],
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  time: String
});

const daySchema = new mongoose.Schema({
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  breakfast: mealSchema,
  snack1: mealSchema,
  lunch: mealSchema,
  snack2: mealSchema,
  dinner: mealSchema
});

const dietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: String,
    enum: ['Weight Loss', 'Muscle Gain', 'Maintain', 'Bulking', 'Cutting', 'Endurance'],
    required: true
  },
  durationWeeks: {
    type: Number,
    default: 4
  },
  dailyCalories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  waterTarget: {
    type: Number,
    default: 2.5
  },
  notes: String,
  days: [daySchema],
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Draft'],
    default: 'Active'
  },
  assignedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
