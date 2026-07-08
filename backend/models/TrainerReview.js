const mongoose = require('mongoose');

const trainerReviewSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerBooking',
    required: true,
    unique: true // Guarantees one review per completed booking
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Prevent reviewing the same booking twice at Mongoose validation level
trainerReviewSchema.index({ bookingId: 1 }, { unique: true });

// Static method to calculate and update Trainer rating statistics
trainerReviewSchema.statics.calculateAverageRating = async function(trainerId) {
  const stats = await this.aggregate([
    { $match: { trainerId } },
    {
      $group: {
        _id: '$trainerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const Trainer = mongoose.model('Trainer');
  if (stats.length > 0) {
    await Trainer.findByIdAndUpdate(trainerId, {
      rating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Trainer.findByIdAndUpdate(trainerId, {
      rating: 0,
      totalReviews: 0
    });
  }
};

// Update stats after save
trainerReviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.trainerId);
});

// Update stats after delete
trainerReviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.calculateAverageRating(this.trainerId);
});

module.exports = mongoose.model('TrainerReview', trainerReviewSchema);
