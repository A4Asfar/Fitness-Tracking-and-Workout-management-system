const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  // Legacy fields (kept for backward compatibility with frontend/APIs)
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  specialization: { type: String }, // Used by legacy
  experience: { type: String }, // Used by legacy
  expertise: { type: String },
  status: { type: String, default: 'Available' },
  image: { type: String },
  accentColor: { type: String, default: '#CCFF00' },
  bio: { type: String },
  recommendedFor: { type: String },
  supportNote: { type: String },
  rating: { type: Number, default: 4.9 },
  
  // New fields for updated requirements
  fullName: { type: String },
  profileImage: { type: String },
  biography: { type: String },
  specializations: [{ type: String }],
  experienceYears: { type: Number },
  qualifications: { type: String },
  certifications: [{ type: String }],
  languages: [{ type: String }],
  totalReviews: { type: Number, default: 0 },
  city: { type: String },
  country: { type: String, default: 'Pakistan' },
  hourlyPrice: { type: Number },
  availabilityStatus: { type: String, enum: ['Online', 'Offline', 'Busy'], default: 'Online' },
  weeklySchedule: { type: mongoose.Schema.Types.Mixed },
  verifiedTrainer: { type: Boolean, default: false },
  featuredTrainer: { type: Boolean, default: false },
}, { timestamps: true });

// Optimize query path for filters and sorting
TrainerSchema.index({ featuredTrainer: -1, rating: -1 });
TrainerSchema.index({ city: 1, availabilityStatus: 1 });
TrainerSchema.index({ specializations: 1 });
TrainerSchema.index({ hourlyPrice: 1 });
TrainerSchema.index({ experienceYears: -1 });

module.exports = mongoose.model('Trainer', TrainerSchema);
