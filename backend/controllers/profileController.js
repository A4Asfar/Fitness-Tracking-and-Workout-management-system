const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide name');
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar },
    { new: true }
  ).select('-password');
  console.log('📝 Profile updated in MongoDB for user:', req.userId);
  res.json(user);
});

exports.upgradeProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { membershipType: 'premium' },
    { new: true }
  ).select('-password');
  console.log('👑 User upgraded to premium:', req.userId);
  res.json(user);
});
