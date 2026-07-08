const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', auth, admin, adminController.getStats);
router.get('/payments/pending', auth, admin, adminController.getPendingPayments);
router.post('/payments/:id/verify', auth, admin, adminController.verifyPayment);

module.exports = router;
