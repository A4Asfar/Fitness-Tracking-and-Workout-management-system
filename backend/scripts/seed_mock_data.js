require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const TrainerBooking = require('../models/TrainerBooking');

const MOCK_USERS = [
  { name: 'Alice Smith', email: 'alice@example.com', password: 'password123', membershipType: 'premium', fitnessGoal: 'Weight Loss' },
  { name: 'Bob Jones', email: 'bob@example.com', password: 'password123', membershipType: 'free', fitnessGoal: 'Muscle Gain' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', membershipType: 'premium', fitnessGoal: 'Endurance' },
  { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', membershipType: 'free', fitnessGoal: 'General Fitness' },
  { name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', membershipType: 'premium', fitnessGoal: 'Muscle Gain' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create mock users
    const createdUsers = [];
    for (let u of MOCK_USERS) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        let newUser = new User(u);
        await newUser.save();
        createdUsers.push(newUser);
      } else {
        createdUsers.push(existing);
      }
    }
    console.log(`Seeded ${createdUsers.length} mock users`);

    // Fetch trainers
    const trainers = await Trainer.find();
    if (trainers.length === 0) {
      console.log('No trainers found! Run seed_trainers.js or seed_content.js first.');
      process.exit(1);
    }

    // Create mock bookings
    const sessionTypes = ['Online', 'In-Person'];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    const goals = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'];

    await TrainerBooking.deleteMany({ notes: 'Mock Booking' }); // Clear previous mock bookings

    const MOCK_BOOKINGS = [];
    for (let i = 0; i < 15; i++) {
      let user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      let trainer = trainers[Math.floor(Math.random() * trainers.length)];
      
      let date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30)); // random date in next 30 days
      let dateString = date.toISOString().split('T')[0];

      MOCK_BOOKINGS.push({
        trainerId: trainer._id,
        userId: user._id,
        bookingDate: dateString,
        bookingTime: `${Math.floor(Math.random() * 8) + 9}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        duration: 60,
        sessionType: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
        fitnessGoal: goals[Math.floor(Math.random() * goals.length)],
        notes: 'Mock Booking',
        totalPrice: Math.floor(Math.random() * 50) + 50,
        bookingStatus: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: 'Paid'
      });
    }

    await TrainerBooking.insertMany(MOCK_BOOKINGS);
    console.log(`Seeded ${MOCK_BOOKINGS.length} mock bookings`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
