const express = require('express');
const router = express.Router();
const { getWeightLogs, createWeightLog } = require('../controllers/weightController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getWeightLogs)
  .post(createWeightLog);

module.exports = router;
