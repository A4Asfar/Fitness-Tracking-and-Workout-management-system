const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const testPass = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'aamirasfar8@gmail.clm' }).select('+password');
    const isMatch = await user.comparePassword('admin123');
    console.log('Does admin123 match?', isMatch);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testPass();
