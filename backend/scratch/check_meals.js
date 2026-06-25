require('dotenv').config();
const mongoose = require('mongoose');
const Meal = require('../models/Meal');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Meal.countDocuments({});
    console.log('Meals count:', count);
    const sample = await Meal.find({}).limit(5);
    console.log('Sample meals:', sample);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
