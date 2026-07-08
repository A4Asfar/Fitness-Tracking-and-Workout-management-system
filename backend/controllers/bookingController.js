const TrainerBooking = require('../models/TrainerBooking');
const Trainer = require('../models/Trainer');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.createBooking = asyncHandler(async (req, res) => {
  const { trainerId, bookingDate, bookingTime, duration, sessionType, fitnessGoal, notes } = req.body;
  const userId = req.userId;

  // Validation
  if (!trainerId || !bookingDate || !bookingTime || !duration || !sessionType || !fitnessGoal) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check past dates
  const today = new Date().toISOString().split('T')[0];
  if (bookingDate < today) {
    res.status(400);
    throw new Error('Cannot book a session in the past');
  }

  // Find trainer to calculate price
  const trainer = await Trainer.findById(trainerId);
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }

  // Price calculation
  const hours = duration / 60;
  const totalPrice = trainer.hourlyPrice * hours;

  // Create booking
  const booking = new TrainerBooking({
    trainerId,
    userId,
    bookingDate,
    bookingTime,
    duration,
    sessionType,
    fitnessGoal,
    notes,
    totalPrice,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending'
  });

  await booking.save();

  try {
    const { createInAppNotification } = require('./notificationController');
    await createInAppNotification(
      userId,
      'Session Booked! 📅',
      `Your request to book ${trainer.fullName || trainer.name} on ${bookingDate} at ${bookingTime} is pending verification.`,
      'Trainer Booking',
      'calendar',
      '/my-bookings'
    );
  } catch (err) {
    console.log('Error creating booking notification:', err.message);
  }

  res.status(201).json(booking);
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const bookings = await TrainerBooking.find({ userId })
    .populate('trainerId', 'fullName name profileImage image specializations specialization rating hourlyPrice')
    .sort({ bookingDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Optimized lean query

  res.json(bookings);
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await TrainerBooking.findOne({ _id: req.params.id, userId: req.userId })
    .populate('trainerId', 'fullName name profileImage image specializations specialization rating hourlyPrice city')
    .lean();

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.json(booking);
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await TrainerBooking.findOne({ _id: req.params.id, userId: req.userId });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed') {
    res.status(400);
    throw new Error(`Cannot cancel a booking that is already ${booking.bookingStatus.toLowerCase()}`);
  }

  booking.bookingStatus = 'Cancelled';
  await booking.save();

  try {
    const { createInAppNotification } = require('./notificationController');
    await createInAppNotification(
      booking.userId,
      'Booking Cancelled ❌',
      `Your session scheduled for ${booking.bookingDate} has been successfully cancelled.`,
      'Booking Cancelled',
      'calendar',
      '/my-bookings'
    );
  } catch (err) {
    console.log('Error creating cancellation notification:', err.message);
  }

  res.json(booking);
});

exports.updateBookingStatus = asyncHandler(async (req, res) => {
  // Usually this would be admin or trainer restricted, but we add it per requirements
  const { status } = req.body;
  const booking = await TrainerBooking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const oldStatus = booking.bookingStatus;
  booking.bookingStatus = status;
  await booking.save();

  try {
    const { createInAppNotification } = require('./notificationController');
    let title = 'Booking Status Updated';
    let type = 'Trainer Booking';
    let message = `Your booking status has been updated to ${status}.`;

    if (status === 'Confirmed') {
      title = 'Booking Approved! ✅';
      type = 'Booking Approved';
      message = `Your session scheduled for ${booking.bookingDate} at ${booking.bookingTime} has been approved!`;
    } else if (status === 'Cancelled') {
      title = 'Booking Cancelled ❌';
      type = 'Booking Cancelled';
      message = `Your session scheduled for ${booking.bookingDate} has been cancelled.`;
    }

    await createInAppNotification(
      booking.userId,
      title,
      message,
      type,
      'calendar',
      '/my-bookings'
    );
  } catch (err) {
    console.log('Error creating status update notification:', err.message);
  }

  res.json(booking);
});
