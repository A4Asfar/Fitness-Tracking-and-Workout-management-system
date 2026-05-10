const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  expertise: { type: String, required: true },
  status: { type: String, default: 'Available' },
  image: { type: String },
  accentColor: { type: String, default: '#CCFF00' },
  bio: { type: String },
  recommendedFor: { type: String },
  supportNote: { type: String },
  rating: { type: Number, default: 4.9 }
}, { timestamps: true });

module.exports = mongoose.model('Trainer', TrainerSchema);
