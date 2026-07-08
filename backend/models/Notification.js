const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'Welcome',
      'Workout Reminder',
      'Meal Reminder',
      'Trainer Booking',
      'Booking Approved',
      'Booking Cancelled',
      'Premium Purchased',
      'Premium Approved',
      'AI Daily Plan Ready',
      'System Announcement',
      'workout',
      'meal',
      'step',
      'weight'
    ],
    required: true,
  },
  icon: {
    type: String,
    default: 'bell',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionRoute: {
    type: String,
    default: null,
  },
  actionId: {
    type: String,
    default: null,
  }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
