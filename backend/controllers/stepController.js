const StepLog = require('../models/StepLog');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getStepLogs = asyncHandler(async (req, res) => {
  const logs = await StepLog.find({ userId: req.userId }).sort({ date: -1 });
  res.json(logs);
});

exports.createStepLog = asyncHandler(async (req, res) => {
  const { steps, note } = req.body;
  if (steps === undefined || steps === null || isNaN(Number(steps))) {
    res.status(400);
    throw new Error('Please provide valid steps');
  }

  const log = new StepLog({
    userId: req.userId,
    steps: Number(steps),
    note,
  });

  await log.save();

  // Generate notification
  await Notification.create({
    userId: req.userId,
    title: 'Steps Logged',
    message: `Successfully logged your steps: ${Number(steps).toLocaleString()}. Keep stepping!`,
    type: 'step'
  });

  console.log('🚶 Step log saved for user:', req.userId);
  res.status(201).json(log);
});
