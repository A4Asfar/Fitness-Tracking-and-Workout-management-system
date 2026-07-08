const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  addTrainerReview,
  getTrainerReviews,
  deleteReview
} = require('../controllers/reviewController');

// Review management
router.post('/trainers/:id/reviews', auth, addTrainerReview);
router.get('/trainers/:id/reviews', getTrainerReviews);
router.delete('/reviews/:id', auth, deleteReview);

module.exports = router;
