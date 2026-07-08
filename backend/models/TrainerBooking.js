const mongoose = require('mongoose');

const trainerBookingSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId, // Or String depending on how trainers are referenced. Our trainers have an `id` string AND `_id` ObjectId. The new seeder uses `_id` implicitly and `id` string explicitly. We will use string `id` or `ObjectId` ref. Let's use `ref: 'Trainer'`
    ref: 'Trainer',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  bookingTime: {
    type: String, // e.g. "09:00 AM"
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['Online', 'In-Person'],
    required: true,
  },
  fitnessGoal: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
}, { timestamps: true });

// Indexes for optimized querying
trainerBookingSchema.index({ userId: 1, bookingDate: -1 });
trainerBookingSchema.index({ trainerId: 1, bookingDate: -1 });

module.exports = mongoose.model('TrainerBooking', trainerBookingSchema);
