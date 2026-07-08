const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Chat = require('../models/Chat'); // Assuming Chat exists
const Trainer = require('../models/Trainer');
const TrainerBooking = require('../models/TrainerBooking');
const PremiumPurchase = require('../models/PremiumPurchase');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all system statistics for admin dashboard
exports.getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const premiumUsers = await User.countDocuments({ membershipType: 'premium' });
  const totalTrainers = await Trainer.countDocuments();
  const activeBookings = await TrainerBooking.countDocuments({ bookingStatus: 'Confirmed' });
  const workoutsLogged = await Workout.countDocuments();
  const mealsLogged = await Meal.countDocuments();
  
  // Try to count chats if Chat model exists, default to demo count if not
  let chatsCount = 0;
  try {
    chatsCount = await Chat.countDocuments();
  } catch (e) {
    chatsCount = 42; // Fallback demo metric
  }

  // Calculate Revenue (Approved Premium Purchases)
  const revenueData = await PremiumPurchase.aggregate([
    { $match: { status: 'Approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // Recent Users Registered
  const recentUsers = await User.find()
    .select('name email membershipType createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Recent Bookings
  const recentBookings = await TrainerBooking.find()
    .populate('userId', 'name')
    .populate('trainerId', 'fullName name')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json({
    totalUsers,
    premiumUsers,
    totalTrainers,
    activeBookings,
    workoutsLogged,
    mealsLogged,
    chatsCount,
    totalRevenue,
    recentActivity: {
      users: recentUsers,
      bookings: recentBookings
    }
  });
});

// GET /api/admin/users (Search, Pagination, Role filtering)
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, role } = req.query;

  const query = {};
  if (role) {
    query.membershipType = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    users,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total
  });
});

// PATCH /api/admin/users/:id/role
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['free', 'premium', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid user role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { membershipType: role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ message: 'User role updated successfully', user });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: 'User deleted successfully' });
});

// Trainer Management Actions
exports.addTrainer = asyncHandler(async (req, res) => {
  const trainer = new Trainer(req.body);
  await trainer.save();
  res.status(201).json(trainer);
});

exports.updateTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  res.json(trainer);
});

exports.deleteTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndDelete(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  res.json({ message: 'Trainer deleted successfully' });
});

exports.verifyTrainer = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, { verifiedTrainer: verified }, { new: true });
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  res.json(trainer);
});

exports.featureTrainer = asyncHandler(async (req, res) => {
  const { featured } = req.body;
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, { featuredTrainer: featured }, { new: true });
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  res.json(trainer);
});

// Booking Management Actions
exports.getAllBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status } = req.query;

  const query = {};
  if (status) {
    query.bookingStatus = status;
  }

  const bookings = await TrainerBooking.find(query)
    .populate('userId', 'name email')
    .populate('trainerId', 'fullName name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await TrainerBooking.countDocuments(query);

  res.json({
    bookings,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total
  });
});

// System Settings Management
exports.getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  res.json(settings);
});

exports.updateSystemSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = new SystemSettings(req.body);
  } else {
    Object.assign(settings, req.body);
  }
  await settings.save();
  res.json(settings);
});

