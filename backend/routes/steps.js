const express = require('express');
const router = express.Router();
const { getStepLogs, createStepLog } = require('../controllers/stepController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getStepLogs)
  .post(createStepLog);

module.exports = router;
