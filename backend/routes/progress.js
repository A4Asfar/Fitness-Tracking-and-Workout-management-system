const express = require('express');
const auth = require('../middleware/auth');
const progressController = require('../controllers/progressController');

const router = express.Router();

router.get('/', auth, progressController.getProgress);
router.put('/', auth, progressController.updateProgress);

module.exports = router;
