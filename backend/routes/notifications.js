const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, createNotification } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router;
