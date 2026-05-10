const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const mongoose = require('mongoose');

// @desc    Get system stats for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  // 1. Total Registered Users
  const totalUsers = await User.countDocuments();

  // 2. Role Distribution
  const roles = await User.aggregate([
    { $group: { _id: '$membershipType', count: { $sum: 1 } } }
  ]);

  const freeCount = roles.find(r => r._id === 'free')?.count || 0;
  const premiumCount = roles.find(r => r._id === 'premium')?.count || 0;
  const adminCount = roles.find(r => r._id === 'admin')?.count || 0;

  // 3. Total Workouts Logged
  // We need to access the Workout model. Assuming it's 'Workout'
  const Workout = mongoose.model('Workout');
  const totalWorkouts = await Workout.countDocuments();

  // 4. Recent Activity (Recent Users)
  const recentUsers = await User.find()
    .select('name email membershipType createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  // 5. Recent Activity (Recent Workouts)
  const recentWorkouts = await Workout.find()
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalUsers,
    freeCount,
    premiumCount,
    adminCount,
    totalWorkouts,
    recentActivity: {
      users: recentUsers,
      workouts: recentWorkouts
    }
  });
});
