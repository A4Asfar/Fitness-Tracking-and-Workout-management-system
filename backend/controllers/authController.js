const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, membershipType } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields (name, email, password)');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const finalRole = (membershipType === 'admin') ? 'free' : (membershipType || 'free');

  const user = await User.create({
    name,
    email,
    password,
    membershipType: finalRole
  });

  if (user) {
    console.log('👤 User registered in MongoDB:', user.email);
    const token = generateToken(user._id);
    
    // Use toObject to include virtuals like 'id'
    const userData = user.toObject();
    delete userData.password;
    userData.id = user._id.toString();

    res.status(201).json({
      token,
      user: userData
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(user._id);
    
    const userData = user.toObject();
    delete userData.password;
    userData.id = user._id.toString();

    res.json({
      token,
      user: userData
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (user) {
    const userData = user.toObject();
    userData.id = user._id.toString();
    
    res.json(userData);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  res.json({ message: 'Password reset link sent (simulated)' });
});
