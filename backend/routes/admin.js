const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', auth, admin, adminController.getStats);
router.get('/payments/pending', auth, admin, adminController.getPendingPayments);
router.post('/payments/:id/verify', auth, admin, adminController.verifyPayment);

// Premium Management Dashboard API
router.get('/payments/list', auth, admin, adminController.getAllPayments);
router.get('/payments/users', auth, admin, adminController.getPremiumUsers);
router.get('/payments/analytics', auth, admin, adminController.getPremiumAnalytics);
router.post('/payments/users/:id/extend', auth, admin, adminController.extendMembership);
router.post('/payments/users/:id/deactivate', auth, admin, adminController.deactivateMembership);

module.exports = router;
