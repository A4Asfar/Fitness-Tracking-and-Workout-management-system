const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Trainer = require('../models/Trainer');
const TrainerReview = require('../models/TrainerReview');
const TrainerBooking = require('../models/TrainerBooking');
const User = require('../models/User');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Get a user to attribute reviews and bookings to
    const user = await User.findOne();
    if (!user) {
      throw new Error('No user found in database. Please register a user first.');
    }

    console.log('Using User ID:', user._id);

    // 1. Create Trainers
    const trainers = [
      {
        id: 'mia-cross',
        name: 'Mia Cross',
        fullName: 'Mia Cross',
        gender: 'Female',
        specialization: 'Yoga',
        specializations: ['Yoga', 'Pilates', 'Mobility'],
        experience: '5 Years',
        experienceYears: 5,
        expertise: 'Flexibility & Core Strength',
        status: 'Available',
        availabilityStatus: 'Online',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=250&auto=format&fit=crop',
        profileImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=250&auto=format&fit=crop',
        accentColor: '#10B981',
        bio: 'Certified Yoga instructor focused on mobility, core strength, and holistic wellness. I will help you unlock your body\'s full potential.',
        biography: 'Certified Yoga instructor focused on mobility, core strength, and holistic wellness. I will help you unlock your body\'s full potential.',
        recommendedFor: 'Flexibility, Core, Meditation',
        supportNote: 'Available 9AM - 5PM Mon-Fri',
        rating: 4.8,
        totalReviews: 0,
        city: 'Islamabad',
        country: 'Pakistan',
        hourlyPrice: 2000,
        verifiedTrainer: true,
        featuredTrainer: true,
        qualifications: '200HR RYT',
        certifications: ['Yoga Alliance', 'Pilates Institute'],
        languages: ['English', 'Urdu']
      },
      {
        id: 'david-chen',
        name: 'David Chen',
        fullName: 'David Chen',
        gender: 'Male',
        specialization: 'HIIT',
        specializations: ['HIIT', 'Cardio', 'Fat Loss'],
        experience: '8 Years',
        experienceYears: 8,
        expertise: 'High Intensity & Weight Loss',
        status: 'Available',
        availabilityStatus: 'Online',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=250&auto=format&fit=crop',
        profileImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=250&auto=format&fit=crop',
        accentColor: '#EF4444',
        bio: 'Push your limits with high-intensity interval training. Fast, efficient workouts for busy people looking to shred fat fast.',
        biography: 'Push your limits with high-intensity interval training. Fast, efficient workouts for busy people looking to shred fat fast.',
        recommendedFor: 'Fat Loss, Endurance, HIIT',
        supportNote: 'Available 6AM - 8PM Daily',
        rating: 4.9,
        totalReviews: 0,
        city: 'Lahore',
        country: 'Pakistan',
        hourlyPrice: 3000,
        verifiedTrainer: true,
        featuredTrainer: true,
        qualifications: 'ACE Certified',
        certifications: ['ACE Personal Trainer', 'CrossFit Level 1'],
        languages: ['English', 'Urdu', 'Punjabi']
      },
      {
        id: 'sarah-jenkins',
        name: 'Sarah Jenkins',
        fullName: 'Sarah Jenkins',
        gender: 'Female',
        specialization: 'Strength',
        specializations: ['Strength Training', 'Bodybuilding', 'Nutrition'],
        experience: '6 Years',
        experienceYears: 6,
        expertise: 'Muscle Hypertrophy & Powerlifting',
        status: 'Available',
        availabilityStatus: 'Offline',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop',
        profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop',
        accentColor: '#8B5CF6',
        bio: 'Build real strength and muscle mass. I focus on heavy compound movements with proper form and customized nutrition plans.',
        biography: 'Build real strength and muscle mass. I focus on heavy compound movements with proper form and customized nutrition plans.',
        recommendedFor: 'Muscle Gain, Powerlifting',
        supportNote: 'In-person sessions only',
        rating: 4.7,
        totalReviews: 0,
        city: 'Karachi',
        country: 'Pakistan',
        hourlyPrice: 2500,
        verifiedTrainer: true,
        featuredTrainer: false,
        qualifications: 'NSCA CSCS',
        certifications: ['NSCA', 'Precision Nutrition'],
        languages: ['English', 'Urdu']
      }
    ];

    console.log('Inserting trainers...');
    const insertedTrainers = await Trainer.insertMany(trainers);
    console.log(`${insertedTrainers.length} Trainers inserted.`);

    console.log('Inserting dummy bookings and reviews...');
    for (const trainer of insertedTrainers) {
      // Create a dummy past booking
      const booking1 = await TrainerBooking.create({
        trainerId: trainer._id,
        userId: user._id,
        bookingDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
        bookingTime: 'Morning',
        duration: 60,
        sessionType: 'Online',
        fitnessGoal: 'Testing Reviews',
        notes: 'Dummy booking for review',
        totalPrice: trainer.hourlyPrice,
        bookingStatus: 'Completed',
        paymentStatus: 'Paid'
      });

      const booking2 = await TrainerBooking.create({
        trainerId: trainer._id,
        userId: user._id,
        bookingDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], // 10 days ago
        bookingTime: 'Evening',
        duration: 45,
        sessionType: 'Online',
        fitnessGoal: 'Testing Reviews',
        notes: 'Dummy booking for review',
        totalPrice: trainer.hourlyPrice,
        bookingStatus: 'Completed',
        paymentStatus: 'Paid'
      });

      // Create reviews tied to bookings
      await TrainerReview.create({
        trainerId: trainer._id,
        userId: user._id,
        bookingId: booking1._id,
        rating: 5,
        review: `Absolutely amazing session! ${trainer.name} really knows how to push you while maintaining proper form.`
      });

      await TrainerReview.create({
        trainerId: trainer._id,
        userId: user._id,
        bookingId: booking2._id,
        rating: 4,
        review: `Great workout. Very knowledgeable and friendly.`
      });
    }

    console.log('Reviews inserted. Mongoose post-save hooks will automatically update Trainer rating stats.');
    
    // Give hooks time to finish async aggregate
    setTimeout(() => {
      console.log('Done!');
      process.exit(0);
    }, 2000);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
