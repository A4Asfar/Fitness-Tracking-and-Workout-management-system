const TrainerReview = require('../models/TrainerReview');
const TrainerBooking = require('../models/TrainerBooking');
const { resolveTrainer } = require('../utils/trainerHelper');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Add review for a trainer
// @route   POST /api/trainers/:id/reviews
// @access  Private
exports.addTrainerReview = asyncHandler(async (req, res) => {
  const trainerId = req.params.id;
  const userId = req.userId;
  const { bookingId, rating, review } = req.body;

  if (!bookingId || !rating || !review) {
    res.status(400);
    throw new Error('Please provide bookingId, rating, and review text.');
  }

  // Validate booking belongs to user, is for this trainer, and is completed
  const booking = await TrainerBooking.findOne({
    _id: bookingId,
    userId,
    trainerId,
    bookingStatus: 'Completed'
  });

  if (!booking) {
    res.status(400);
    throw new Error('No completed booking found for this trainer to review.');
  }

  // Check if booking has already been reviewed
  const existingReview = await TrainerReview.findOne({ bookingId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already submitted a review for this booking.');
  }

  const newReview = new TrainerReview({
    trainerId,
    userId,
    bookingId,
    rating: Number(rating),
    review
  });

  await newReview.save();
  res.status(201).json(newReview);
});

// @desc    Get all reviews for a trainer (with stats & pagination)
// @route   GET /api/trainers/:id/reviews
// @access  Public
exports.getTrainerReviews = asyncHandler(async (req, res) => {
  const trainer = await resolveTrainer(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }

  const trainerObjectId = trainer._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await TrainerReview.find({ trainerId: trainerObjectId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await TrainerReview.countDocuments({ trainerId: trainerObjectId });

  const distributionData = await TrainerReview.aggregate([
    { $match: { trainerId: trainerObjectId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distributionData.forEach(item => {
    distribution[item._id] = item.count;
  });

  res.json({
    reviews,
    total,
    pages: Math.ceil(total / limit),
    distribution
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await TrainerReview.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Ensure user owns the review
  if (review.userId.toString() !== req.userId) {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  const trainerId = review.trainerId;
  await review.deleteOne();
  
  // Recalculate average rating manually since hook references constructor
  await TrainerReview.calculateAverageRating(trainerId);

  res.json({ message: 'Review deleted successfully' });
});
