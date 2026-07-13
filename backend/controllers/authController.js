const User = require('../models/User');

const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { APP_NAME, APP_PRO } = require('../constants/brand');

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
    
    // Trigger in-app Welcome notification
    try {
      const { createInAppNotification } = require('./notificationController');
      await createInAppNotification(
        user._id,
        `Welcome to ${APP_NAME}! 🎉`,
        'We are thrilled to join you on your fitness journey. Start checking out workout suggestors, meal planners, and trainers.',
        'Welcome',
        'bell'
      );
    } catch (err) {
      console.log('Error triggering welcome notification:', err.message);
    }
    
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

  console.log('\n--- TEMPORARY LOGIN DIAGNOSTICS START ---');
  console.log(`1. Email received from frontend: ${email}`);
  console.log(`2. Password Length = ${password.length}`);

  const user = await User.findOne({ email }).select('+password');
  console.log(`3. User.findOne() returned a user: ${user !== null}`);

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  console.log(`4. Stored hash length: ${user.password.length}`);

  const isMatch = await user.comparePassword(password);
  console.log(`5. comparePassword() result: ${isMatch}`);

  if (isMatch) {
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

const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

/**
 * @desc    Forgot Password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000;

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = expiry;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: `Your ${APP_NAME} Password Reset Code`,
      otp,
    });

    console.log('📧 Password reset OTP sent to:', user.email);

    const payload = { message: 'OTP sent to your email' };
    if (process.env.NODE_ENV !== 'production' && !sendEmail.isEmailConfigured) {
      payload.devOtp = otp;
    }
    res.json(payload);
  } catch (error) {
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.error('❌ EMAIL ERROR DETAILS:', error.message);
    res.status(500);
    throw new Error(error.message || 'Failed to send reset email. Please try again.');
  }
});

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
exports.verifyResetCode = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  res.json({ message: 'OTP verified successfully', verified: true });
});

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const password = String(req.body.password || '');

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
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP. Please start again.');
  }

  user.password = password;
  user.resetPasswordOTP = null;
  user.resetPasswordExpires = null;
  await user.save();

  console.log('✅ Password successfully reset for:', user.email);
  res.json({ message: 'Password reset successful' });
});


