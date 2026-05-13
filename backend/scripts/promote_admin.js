require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function promoteAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@peakpulse.ai';

    // Find the user and update role
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { membershipType: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ SUCCESS: User ${email} has been promoted to ADMIN!`);
    } else {
      console.log(`❌ ERROR: Could not find a user with email ${email}. Make sure you signed up on the website first!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error promoting admin:', error);
    process.exit(1);
  }
}

promoteAdmin();
