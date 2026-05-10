const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  goalType: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  estimatedCalories: {
    type: Number,
    required: true
  },
  warmup: [{
    exercise: String,
    duration: String
  }],
  exercises: [{
    name: String,
    sets: Number,
    reps: String,
    rest: String,
    notes: String,
    icon: String
  }],
  nutrition: {
    breakfast: String,
    lunch: String,
    dinner: String,
    snack: String,
    hydration: String,
    proteinTarget: String
  },
  recovery: String,
  motivation: String
}, { timestamps: true });

// Compound index to quickly find a user's plan for a specific date
dailyPlanSchema.index({ userId: 1, generatedDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
