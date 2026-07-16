const mongoose = require('mongoose');

const dietPlanMealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  servingSize: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  notes: String
});

const dietPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: String,
    enum: ['Weight Loss', 'Muscle Gain', 'Maintain', 'Bulking', 'Cutting', 'Endurance'],
    required: true
  },
  targetCalories: {
    type: Number,
    required: true
  },
  targetProtein: {
    type: Number,
    required: true
  },
  targetCarbs: {
    type: Number,
    required: true
  },
  targetFat: {
    type: Number,
    required: true
  },
  waterTargetLiters: {
    type: Number,
    default: 2.5
  },
  meals: [dietPlanMealSchema],
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
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
