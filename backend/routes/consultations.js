const express = require('express');
const { auth } = require('../middleware/auth');
const consultationController = require('../controllers/consultationController');

const router = express.Router();

router.post('/', auth, consultationController.logConsultation);
router.get('/', auth, consultationController.getConsultations);

module.exports = router;
