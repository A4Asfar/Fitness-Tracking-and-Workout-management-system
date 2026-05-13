require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@peakpulse.ai';
    const password = 'Admin123!';

    // Check if admin already exists
    let admin = await User.findOne({ email });

    if (admin) {
      console.log('Admin already exists. Updating password and role...');
      admin.password = password;
      admin.membershipType = 'admin';
      await admin.save();
    } else {
      console.log('Creating new Admin account...');
      admin = await User.create({
        name: 'System Admin',
        email: email,
        password: password,
        membershipType: 'admin'
      });
    }

    console.log('\n=========================================');
    console.log('🚀 ADMIN ACCOUNT READY');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
