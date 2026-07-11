const mongoose = require('mongoose');

const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb+srv://asfaramir790_db_user:asfaramir456@fitness013.hrkgejq.mongodb.net/fitnessapp');
    
    // Check if user exists
    let user = await User.findOne({ email: 'aamirasfar8@gmail.clm' });
    if (user) {
      console.log('User already exists, updating password and role...');
      user.password = 'admin123';
      user.membershipType = 'admin';
      await user.save();
    } else {
      console.log('Creating new admin user...');
      user = new User({
        name: 'Asfar Amir (Admin)',
        email: 'aamirasfar8@gmail.clm',
        password: 'admin123',
        membershipType: 'admin'
      });
      await user.save();
    }
    
    console.log('Success! Admin account is ready in the /fitnessapp DB.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
