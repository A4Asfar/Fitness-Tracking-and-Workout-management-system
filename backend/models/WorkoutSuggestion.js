const mongoose = require('mongoose');

const WorkoutSuggestionSchema = new mongoose.Schema({
  exercise: { type: String, required: true },
  reason: { type: String, required: true },
  type: { type: String, required: true }, // Strength, Cardio, HIIT, Yoga
  level: { type: String, required: true }, // Beginner, Intermediate, Advanced
  focus: { type: String, required: true }, // Strength, Cardio, HIIT, Flexibility
  icon: { type: String, default: 'Dumbbell' }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutSuggestion', WorkoutSuggestionSchema);
