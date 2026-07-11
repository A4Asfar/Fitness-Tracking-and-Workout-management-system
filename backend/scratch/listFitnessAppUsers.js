const mongoose = require('mongoose');

const User = require('../models/User');

const listFitnessAppUsers = async () => {
  try {
    await mongoose.connect('mongodb+srv://asfaramir790_db_user:asfaramir456@fitness013.hrkgejq.mongodb.net/fitnessapp');
    const users = await User.find({}).select('email name membershipType');
    console.log('Users in /fitnessapp DB:', users.map(u => ({ email: u.email, name: u.name, type: u.membershipType })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listFitnessAppUsers();
