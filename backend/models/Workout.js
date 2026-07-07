const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exercise: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
  },
  reps: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['Strength', 'Cardio', 'HIIT', 'Yoga'],
    default: 'Strength',
  },
  duration: {
    type: Number,
    default: 0,
  },
  distance: {
    type: Number,
  },
  calories: {
    type: Number,
  },
  speed: {
    type: Number,
  },
  rounds: {
    type: Number,
  },
  workTime: {
    type: Number,
  },
  restTime: {
    type: Number,
  },
  difficulty: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workout', workoutSchema);
