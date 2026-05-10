require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const user = await User.findOneAndUpdate(
      { email: 'aamirasfar4@gmail.com' },
      { membershipType: 'premium' },
      { returnDocument: 'after' }
    );
    
    if (user) {
      console.log(`✅ User ${user.email} promoted to ${user.membershipType}`);
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

promoteUser();
