const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const resetPass = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the admin user
    const user = await User.findOne({ email: 'aamirasfar8@gmail.clm' });
    if (!user) {
      console.log('Admin user not found');
      process.exit(0);
    }
    
    // The pre('save') hook will hash this automatically
    user.password = 'admin123';
    await user.save();
    
    console.log(`Success! Password for ${user.email} is now: admin123`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetPass();
