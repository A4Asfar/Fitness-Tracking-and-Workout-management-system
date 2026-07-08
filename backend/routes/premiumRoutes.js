const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  submitPurchase,
  getMyStatus,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/premiumController');

// User Routes
router.post('/purchase', auth, submitPurchase);
router.get('/my', auth, getMyStatus);

// Admin Routes
router.get('/admin/requests', auth, admin, getAllRequests);
router.patch('/admin/requests/:id', auth, admin, updateRequestStatus);

module.exports = router;
