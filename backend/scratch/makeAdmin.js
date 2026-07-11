const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const makeAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the first user or you can find by email if you want
    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(0);
    }
    
    user.membershipType = 'admin';
    await user.save();
    
    console.log(`Success! User ${user.email} is now an ADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

makeAdmin();
