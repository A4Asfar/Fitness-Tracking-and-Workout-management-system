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

  console.log(`🔐 Login attempt for: ${email}`);
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`❌ Login failed: User not found with email: ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (isMatch) {
    console.log(`✅ Login successful for: ${email}`);
    const token = generateToken(user._id);
    
    const userData = user.toObject();
    delete userData.password;
    userData.id = user._id.toString();

    res.json({
      token,
      user: userData
    });
  } else {
    console.log(`❌ Login failed: Password mismatch for: ${email}`);
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

const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

/**
 * @desc    Forgot Password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry (10 minutes from now)
  const expiry = Date.now() + 10 * 60 * 1000;

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = expiry;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your FitPro AI Password Reset Code',
      otp: otp,
    });

    console.log('📧 Password reset OTP sent to:', user.email);
    console.log('🔑 DEBUG OTP:', otp); // Safety net for presentation
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.error('❌ EMAIL ERROR DETAILS:', error);
    res.status(500);
    throw new Error(`Email failed: ${error.message}`);
  }
});

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
exports.verifyResetCode = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  const user = await User.findOne({ 
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  res.json({ message: 'OTP verified successfully' });
});

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findOne({ 
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP. Please start again.');
  }

  // Update password (hashing is handled by the model's pre-save hook)
  user.password = password;
  user.resetPasswordOTP = null;
  user.resetPasswordExpires = null;
  await user.save();

  console.log('✅ Password successfully reset for:', user.email);
  res.json({ message: 'Password reset successful' });
});
