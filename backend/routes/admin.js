const express = require('express');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', auth, admin, adminController.getStats);

module.exports = router;
