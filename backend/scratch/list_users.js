require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'email name membershipType');
    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u.name} (${u.email}) - ${u.membershipType}`));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listUsers();
