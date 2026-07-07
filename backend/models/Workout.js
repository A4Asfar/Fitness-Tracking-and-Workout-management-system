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
    default: 0,
  },
  reps: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    default: 0,
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
    default: 0,
  },
  calories: {
    type: Number,
    default: 0,
  },
  speed: {
    type: Number,
    default: 0,
  },
  rounds: {
    type: Number,
    default: 0,
  },
  workTime: {
    type: Number,
    default: 0,
  },
  restTime: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workout', workoutSchema);
