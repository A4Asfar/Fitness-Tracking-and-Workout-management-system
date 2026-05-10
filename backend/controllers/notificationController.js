const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(notifications);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json(notification);
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, message, type } = req.body;
  const notification = await Notification.create({
    userId: req.userId,
    title,
    message,
    type,
  });
  res.status(201).json(notification);
});
