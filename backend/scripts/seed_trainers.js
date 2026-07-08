require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');

const cities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Multan', 'Peshawar'];
const specializationsPool = [
  'Weight Loss', 'Muscle Gain', 'Bodybuilding', 'Strength', 'HIIT', 
  'Yoga', 'Pilates', 'CrossFit', 'Sports Conditioning', 'Nutrition Coaching', 
  'Powerlifting', 'Functional Training'
];
const qualificationsList = [
  'BS Sports Sciences', 'MSc Exercise Physiology', 'BSc Physical Education', 
  'Diploma in Fitness Training', 'Certified Personal Trainer (CPT)', 'BS Nutrition and Dietetics'
];
const certificationsList = [
  'ACE Certified', 'NASM Certified', 'ISSA Certified Personal Trainer', 
  'CrossFit Level 1', 'Precision Nutrition Level 1', 'Yoga Alliance RYT 200'
];
const languagesList = ['Urdu', 'English', 'Punjabi', 'Pashto', 'Sindhi'];
const availabilityStatuses = ['Online', 'Offline', 'Busy'];
const colors = ['#CCFF00', '#00D1FF', '#FF4B4B', '#9D4EDD', '#FF9E00', '#06D6A0'];

const generateRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomItems = (arr, min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const maleNames = [
  'Ahmed Ali', 'Usman Khan', 'Tariq Mahmood', 'Bilal Saeed', 'Faisal Qureshi', 
  'Imran Raza', 'Kamran Asif', 'Salman Shah', 'Zeeshan Farooq', 'Hamza Bukhari', 
  'Ali Hassan', 'Omar Sheikh', 'Noman Javed', 'Saad Qayyum', 'Waqas Rafiq'
];
const femaleNames = [
  'Ayesha Amin', 'Fatima Noor', 'Sana Malik', 'Zara Haider', 'Hira Tareen', 
  'Nida Yasir', 'Sadia Khan', 'Mahnoor Baloch', 'Kiran Haq', 'Anam Fayyaz', 
  'Rabia Chaudhry', 'Zainab Abbas', 'Iram Parveen', 'Fiza Ali', 'Sonia Hussain'
];

const trainersData = [];

// Generate Male Trainers
maleNames.forEach((name, index) => {
  trainersData.push(createTrainerObject(name, 'Male', `https://randomuser.me/api/portraits/men/${index + 10}.jpg`));
});

// Generate Female Trainers
femaleNames.forEach((name, index) => {
  trainersData.push(createTrainerObject(name, 'Female', `https://randomuser.me/api/portraits/women/${index + 10}.jpg`));
});

function createTrainerObject(fullName, gender, profileImage) {
  const id = fullName.toLowerCase().replace(/ /g, '-');
  const expYears = randomInt(1, 20);
  const specs = generateRandomItems(specializationsPool, 1, 3);
  const mainSpec = specs[0];
  const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
  const reviews = randomInt(5, 500);
  const price = randomInt(2000, 15000);
  const city = generateRandomItem(cities);
  const bio = `Hi, I am ${fullName}, a dedicated fitness professional based in ${city}. With over ${expYears} years of experience specializing in ${specs.join(' and ')}, I have helped countless clients achieve their goals. My approach is tailored, scientifically backed, and designed to push your limits.`;
  
  return {
    // New Fields
    fullName,
    profileImage,
    biography: bio,
    specializations: specs,
    experienceYears: expYears,
    qualifications: generateRandomItem(qualificationsList),
    certifications: generateRandomItems(certificationsList, 1, 2),
    languages: ['Urdu', 'English', ...generateRandomItems(languagesList.slice(2), 0, 1)],
    totalReviews: reviews,
    city,
    country: 'Pakistan',
    hourlyPrice: price,
    availabilityStatus: generateRandomItem(availabilityStatuses),
    weeklySchedule: {
      Monday: '09:00 AM - 05:00 PM',
      Tuesday: '09:00 AM - 05:00 PM',
      Wednesday: '09:00 AM - 05:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 05:00 PM',
      Saturday: '10:00 AM - 02:00 PM',
      Sunday: 'Off'
    },
    verifiedTrainer: Math.random() > 0.3, // 70% verified
    featuredTrainer: Math.random() > 0.8, // 20% featured
    
    // Legacy Fields
    id,
    name: fullName,
    gender,
    specialization: mainSpec,
    experience: `${expYears} years`,
    expertise: specs.join(', '),
    status: 'Available',
    image: profileImage,
    accentColor: generateRandomItem(colors),
    bio: bio,
    recommendedFor: `Clients looking for ${mainSpec} and overall fitness improvements.`,
    supportNote: `Let's work together to achieve your best self!`,
    rating: parseFloat(rating)
  };
}

async function seedTrainers() {
  const startTime = Date.now();
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Bulk operations setup
    const bulkOps = trainersData.map(trainer => ({
      updateOne: {
        filter: { id: trainer.id },
        update: { $set: trainer },
        upsert: true
      }
    }));

    const result = await Trainer.bulkWrite(bulkOps);

    const upsertedCount = result.upsertedCount || 0;
    const modifiedCount = result.modifiedCount || 0;
    // Elements that were neither upserted nor modified are considered skipped (already exist & identical)
    const skippedCount = bulkOps.length - upsertedCount - modifiedCount;
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('--- Seeding Results ---');
    console.log(`Total Trainers Processed: ${bulkOps.length}`);
    console.log(`Newly Inserted: ${upsertedCount}`);
    console.log(`Updated (existing matched): ${modifiedCount}`);
    console.log(`Skipped (no changes): ${skippedCount}`);
    console.log(`Execution Time: ${executionTime} seconds`);
    console.log('-----------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedTrainers();
