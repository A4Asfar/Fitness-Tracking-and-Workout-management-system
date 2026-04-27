const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('weight');
  res.json(user);
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  if (weight === undefined) {
    res.status(400);
    throw new Error('Please provide weight');
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { weight },
    { new: true }
  ).select('weight');
  res.json(user);
});
