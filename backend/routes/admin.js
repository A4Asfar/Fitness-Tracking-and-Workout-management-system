const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(auth);
router.use(admin);

router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Trainer Management
router.post('/trainers', adminController.addTrainer);
router.put('/trainers/:id', adminController.updateTrainer);
router.delete('/trainers/:id', adminController.deleteTrainer);
router.patch('/trainers/:id/verify', adminController.verifyTrainer);
router.patch('/trainers/:id/feature', adminController.featureTrainer);

// Booking Management
router.get('/bookings', adminController.getAllBookings);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Legacy Payment Routes for backward compatibility in verify-payments.tsx
const oldAdminController = {
  getPendingPayments: async (req, res) => {
    const PremiumPurchase = require('../models/PremiumPurchase');
    const payments = await PremiumPurchase.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(payments);
  },
  verifyPayment: async (req, res) => {
    const { status, adminRemarks } = req.body;
    const PremiumPurchase = require('../models/PremiumPurchase');
    const User = require('../models/User');
    const payment = await PremiumPurchase.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Not found' });
    payment.status = status;
    if (adminRemarks) payment.adminRemarks = adminRemarks;
    await payment.save();
    if (status === 'Approved') {
      const user = await User.findById(payment.userId);
      if (user) {
        user.membershipType = 'premium';
        await user.save();
      }
    }
    res.json(payment);
  },
  getAllPayments: async (req, res) => {
    const PremiumPurchase = require('../models/PremiumPurchase');
    const items = await PremiumPurchase.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({ items, totalPages: 1, page: 1, limit: 20, total: items.length });
  },
  getPremiumUsers: async (req, res) => {
    const User = require('../models/User');
    const users = await User.find({ membershipType: 'premium' }).select('name email avatar createdAt membershipExpiresAt');
    res.json(users);
  },
  getPremiumAnalytics: async (req, res) => {
    const User = require('../models/User');
    const PremiumPurchase = require('../models/PremiumPurchase');
    const totalPremium = await User.countDocuments({ membershipType: 'premium' });
    const pendingRequests = await PremiumPurchase.countDocuments({ status: 'Pending' });
    res.json({ totalPremium, pendingRequests, estimatedRevenue: 15000, approvalRate: 85 });
  },
  extendMembership: async (req, res) => {
    const { days } = req.body;
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    if (user) {
      const d = user.membershipExpiresAt ? new Date(user.membershipExpiresAt) : new Date();
      d.setDate(d.getDate() + parseInt(days));
      user.membershipExpiresAt = d;
      await user.save();
    }
    res.json({ message: 'Extended' });
  },
  deactivateMembership: async (req, res) => {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.id, { membershipType: 'free', membershipExpiresAt: null });
    res.json({ message: 'Deactivated' });
  }
};

router.get('/payments/pending', oldAdminController.getPendingPayments);
router.post('/payments/:id/verify', oldAdminController.verifyPayment);
router.get('/payments/list', oldAdminController.getAllPayments);
router.get('/payments/users', oldAdminController.getPremiumUsers);
router.get('/payments/analytics', oldAdminController.getPremiumAnalytics);
router.post('/payments/users/:id/extend', oldAdminController.extendMembership);
router.post('/payments/users/:id/deactivate', oldAdminController.deactivateMembership);

module.exports = router;
