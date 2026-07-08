const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all notifications with pagination and dynamic filter
exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { filter, search } = req.query;

  const query = { userId: req.userId };

  // Handle Category Filter
  if (filter && filter !== 'All') {
    if (filter === 'Unread') {
      query.isRead = false;
    } else if (filter === 'Bookings') {
      query.type = { $in: ['Trainer Booking', 'Booking Approved', 'Booking Cancelled'] };
    } else if (filter === 'Premium') {
      query.type = { $in: ['Premium Purchased', 'Premium Approved'] };
    } else if (filter === 'Workout') {
      query.type = 'Workout Reminder';
    } else if (filter === 'System') {
      query.type = { $in: ['Welcome', 'System Announcement'] };
    }
  }

  // Handle Search text
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

  res.json({
    notifications,
    unreadCount,
    total,
    pages: Math.ceil(total / limit)
  });
});

// Mark single notification as read
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

// Mark all as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId, isRead: false },
    { isRead: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

// Delete single notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({ message: 'Notification deleted successfully' });
});

// Shared helper function to trigger notifications throughout the backend
exports.createInAppNotification = async (userId, title, message, type, icon = 'bell', actionRoute = null, actionId = null) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      icon,
      actionRoute,
      actionId
    });
  } catch (error) {
    console.error('Error creating in-app notification:', error.message);
  }
};


