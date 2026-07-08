const PremiumPurchase = require('../models/PremiumPurchase');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { APP_NAME } = require('../constants/brand');

// @route POST /api/premium/purchase
// Submit payment request
exports.submitPurchase = asyncHandler(async (req, res) => {
  const { plan, amount, paymentMethod, transactionId, paymentScreenshot, notes } = req.body;
  const userId = req.userId;

  if (!plan || !amount || !paymentMethod || !transactionId || !paymentScreenshot) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if a pending request already exists
  const existingPending = await PremiumPurchase.findOne({ userId, status: 'Pending' });
  if (existingPending) {
    res.status(400);
    throw new Error('You already have a pending request. Please wait for verification.');
  }

  const purchase = new PremiumPurchase({
    userId,
    plan,
    amount,
    paymentMethod,
    transactionId,
    paymentScreenshot,
    notes,
    status: 'Pending'
  });

  await purchase.save();

  try {
    const { createInAppNotification } = require('./notificationController');
    await createInAppNotification(
      userId,
      'Premium Requested 💳',
      `Your premium plan request for ${plan} (PKR ${amount}) has been submitted for manual approval.`,
      'Premium Purchased',
      'award',
      '/premium'
    );
  } catch (err) {
    console.log('Error creating premium submission notification:', err.message);
  }

  res.status(201).json({ message: 'Payment submitted successfully', purchase });
});

// @route GET /api/premium/my
// Get current user's request status / premium info
exports.getMyStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const latestPurchase = await PremiumPurchase.findOne({ userId }).sort({ createdAt: -1 }).lean();
  const user = await User.findById(userId).select('membershipType membershipExpiresAt');

  res.json({
    membershipType: user.membershipType,
    membershipExpiresAt: user.membershipExpiresAt,
    latestPurchase: latestPurchase || null
  });
});

// @route GET /api/premium/admin/requests
// Admin get all requests
exports.getAllRequests = asyncHandler(async (req, res) => {
  const requests = await PremiumPurchase.find({})
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
  res.json(requests);
});

// @route PATCH /api/premium/admin/requests/:id
// Admin approve/reject request and upgrade user
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminRemarks } = req.body;
  const purchaseId = req.params.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const purchase = await PremiumPurchase.findById(purchaseId);
  if (!purchase) {
    res.status(404);
    throw new Error('Purchase not found');
  }

  purchase.status = status;
  if (adminRemarks) purchase.adminRemarks = adminRemarks;

  await purchase.save();

  if (status === 'Approved') {
    const user = await User.findById(purchase.userId);
    if (user) {
      user.membershipType = 'premium';
      
      // Calculate expiry
      const expiryDate = new Date();
      if (purchase.plan === 'Yearly Plan') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      user.membershipExpiresAt = expiryDate;
      await user.save();
    }
  }

  try {
    const { createInAppNotification } = require('./notificationController');
    const title = status === 'Approved' ? 'Premium Approved! 👑' : 'Premium Request Rejected ❌';
    const type = status === 'Approved' ? 'Premium Approved' : 'Premium Purchased';
    const message = status === 'Approved' 
      ? `Congratulations! Your request for ${purchase.plan} has been approved. You now have full access to ${APP_NAME} Pro.`
      : `Your request for ${purchase.plan} was rejected. Reason: ${adminRemarks || 'Invalid transaction receipt.'}`;
    
    await createInAppNotification(
      purchase.userId,
      title,
      message,
      type,
      'award',
      '/premium'
    );
  } catch (err) {
    console.log('Error creating premium status change notification:', err.message);
  }

  res.json({ message: `Purchase ${status}`, purchase });
});
