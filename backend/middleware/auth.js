const jwt = require('jsonwebtoken');

const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Authentication failed.' });
    }
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.membershipType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

/**
 * Premium middleware — must be used AFTER auth middleware.
 * Allows access only to users with membershipType 'premium' or 'admin'.
 * Returns HTTP 403 for free users.
 */
const premium = (req, res, next) => {
  const membershipType = req.user && req.user.membershipType;
  if (membershipType === 'premium' || membershipType === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'This feature requires a Premium membership.',
      code: 'PREMIUM_REQUIRED',
    });
  }
};

module.exports = { auth, admin, premium };
