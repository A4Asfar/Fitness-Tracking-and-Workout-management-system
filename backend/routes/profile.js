const express = require('express');
const { auth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.get('/', auth, profileController.getProfile);
router.put('/', auth, profileController.updateProfile);
router.put('/upgrade', auth, profileController.upgradeProfile);
router.get('/analytics', auth, profileController.getDashboardStats);

module.exports = router;
