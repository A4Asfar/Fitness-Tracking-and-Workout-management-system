const WeightLog = require('../models/WeightLog');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getWeightLogs = asyncHandler(async (req, res) => {
  const logs = await WeightLog.find({ userId: req.userId }).sort({ date: -1 });
  res.json(logs);
});

exports.createWeightLog = asyncHandler(async (req, res) => {
  const { weight, note } = req.body;
  if (!weight) {
    res.status(400);
    throw new Error('Please provide weight');
  }

  const log = new WeightLog({
    userId: req.userId,
    weight,
    note,
  });

  await log.save();

  // Generate notification
  await Notification.create({
    userId: req.userId,
    title: 'Weight Logged',
    message: `Successfully logged your weight: ${weight}kg. Keep tracking your progress!`,
    type: 'weight'
  });

  console.log('⚖️ Weight log saved for user:', req.userId);
  res.status(201).json(log);
});
