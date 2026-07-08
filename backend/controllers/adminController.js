const User = require('../models/User');
const Workout = require('../models/Workout');
const PremiumPayment = require('../models/PremiumPayment');
const Notification = require('../models/Notification');
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

    // Notify user of approval
    await Notification.create({
      userId: payment.userId,
      title: 'Premium Activated! 🎉',
      message: 'Congratulations! Your premium membership has been activated. Enjoy unlimited access to all features.',
      type: 'premium'
    });

    console.log('✅ Approved payment. User upgraded to premium:', payment.userEmail);
  } else {
    payment.rejectedAt = new Date();
    
    // Downgrade/Keep free
    await User.findByIdAndUpdate(payment.userId, {
      membershipType: 'free',
      membershipExpiresAt: null
    });

    // Notify user of rejection
    await Notification.create({
      userId: payment.userId,
      title: 'Payment Verification Failed',
      message: `Your payment was rejected. Reason: ${adminRemarks || 'Invalid transaction receipt.'}. Please submit another payment proof.`,
      type: 'premium'
    });

    console.log('❌ Rejected payment. User status remains free:', payment.userEmail);
  }

  await payment.save();
  res.json(payment);
});

// @desc    Get all payment requests with search, filter, and pagination
// @route   GET /api/admin/payments/list
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, status, plan, sort } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }
  if (plan) {
    query.plan = plan;
  }
  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOrder = sort === 'oldest' ? 1 : -1;

  const [items, total] = await Promise.all([
    PremiumPayment.find(query).sort({ submittedAt: sortOrder }).skip(skip).limit(limit),
    PremiumPayment.countDocuments(query)
  ]);

  res.json({
    items,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get all Premium users
// @route   GET /api/admin/payments/users
// @access  Private/Admin
exports.getPremiumUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ membershipType: 'premium' }).select('name email avatar createdAt membershipExpiresAt');
  res.json(users);
});

// @desc    Get Premium Analytics
// @route   GET /api/admin/payments/analytics
// @access  Private/Admin
exports.getPremiumAnalytics = asyncHandler(async (req, res) => {
  // 1. Total Premium Users
  const totalPremium = await User.countDocuments({ membershipType: 'premium' });

  // 2. Pending Requests
  const pendingRequests = await PremiumPayment.countDocuments({ status: 'Pending' });

  // 3. Approved & Rejected counts
  const approvedCount = await PremiumPayment.countDocuments({ status: 'Approved' });
  const rejectedCount = await PremiumPayment.countDocuments({ status: 'Rejected' });

  // 4. Monthly & Lifetime users breakdown
  // Let's count from user membership expiration
  const activeMonthly = await User.countDocuments({
    membershipType: 'premium',
    membershipExpiresAt: { $ne: null }
  });

  const lifetimePremium = await User.countDocuments({
    membershipType: 'premium',
    membershipExpiresAt: null
  });

  // 5. Estimated Revenue
  // Plan prices: Monthly = PKR 499, Lifetime = PKR 2999
  const monthlyPayments = await PremiumPayment.countDocuments({ status: 'Approved', plan: 'Monthly' });
  const lifetimePayments = await PremiumPayment.countDocuments({ status: 'Approved', plan: 'Lifetime' });
  const estimatedRevenue = (monthlyPayments * 499) + (lifetimePayments * 2999);

  // 6. Today's New Premium Users
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayNewPremium = await PremiumPayment.countDocuments({
    status: 'Approved',
    approvedAt: { $gte: startOfToday }
  });

  // Calculate approval rate
  const totalProcessed = approvedCount + rejectedCount;
  const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 100;

  res.json({
    totalPremium,
    pendingRequests,
    activeMonthly,
    lifetimePremium,
    estimatedRevenue,
    todayNewPremium,
    approvalRate,
    approvedCount,
    rejectedCount
  });
});

// @desc    Extend membership
// @route   POST /api/admin/payments/users/:id/extend
// @access  Private/Admin
exports.extendMembership = asyncHandler(async (req, res) => {
  const { days } = req.body;
  if (!days || isNaN(days)) {
    res.status(400);
    throw new Error('Please provide valid number of days');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let currentExpiry = user.membershipExpiresAt ? new Date(user.membershipExpiresAt) : new Date();
  if (currentExpiry < new Date()) {
    currentExpiry = new Date();
  }

  currentExpiry.setDate(currentExpiry.getDate() + parseInt(days));

  user.membershipType = 'premium';
  user.membershipExpiresAt = currentExpiry;
  await user.save();

  // Create notification
  await Notification.create({
    userId: user._id,
    title: 'Membership Extended! 🚀',
    message: `Your premium membership has been extended by ${days} days. New expiry: ${currentExpiry.toLocaleDateString()}`,
    type: 'premium'
  });

  res.json({
    message: 'Membership extended successfully',
    membershipExpiresAt: currentExpiry
  });
});

// @desc    Deactivate Premium membership
// @route   POST /api/admin/payments/users/:id/deactivate
// @access  Private/Admin
exports.deactivateMembership = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.membershipType = 'free';
  user.membershipExpiresAt = null;
  await user.save();

  // Notify user
  await Notification.create({
    userId: user._id,
    title: 'Premium Membership Deactivated',
    message: 'Your premium membership has been deactivated. Please contact support if you think this is a mistake.',
    type: 'premium'
  });

  res.json({ message: 'Membership deactivated successfully' });
});
