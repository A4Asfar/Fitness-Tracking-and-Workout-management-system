const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(auth);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/status', admin, updateBookingStatus);

module.exports = router;
