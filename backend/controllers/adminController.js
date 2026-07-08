const User = require('../models/User');
const Workout = require('../models/Workout');
const PremiumPayment = require('../models/PremiumPayment');
const { asyncHandler } = require('../middleware/errorMiddleware');

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

exports.getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await PremiumPayment.find({ status: 'Pending' }).sort({ submittedAt: -1 });
  res.json(payments);
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { status, adminRemarks } = req.body;
  if (!status || !['Approved', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Please provide a valid verification status');
  }

  const payment = await PremiumPayment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  payment.status = status;
  payment.adminRemarks = adminRemarks || '';

  if (status === 'Approved') {
    payment.approvedAt = new Date();
    
    // Set expiry
    let expiry = null;
    if (payment.plan === 'Monthly') {
      expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
    }
    payment.expiryDate = expiry;

    // Upgrade user
    await User.findByIdAndUpdate(payment.userId, {
      membershipType: 'premium',
      membershipExpiresAt: expiry
    });
    console.log('✅ Approved payment. User upgraded to premium:', payment.userEmail);
  } else {
    payment.rejectedAt = new Date();
    
    // Downgrade/Keep free
    await User.findByIdAndUpdate(payment.userId, {
      membershipType: 'free',
      membershipExpiresAt: null
    });
    console.log('❌ Rejected payment. User status remains free:', payment.userEmail);
  }

  await payment.save();
  res.json(payment);
});
