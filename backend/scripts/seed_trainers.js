require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');

const cities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot'];
const specializationsPool = [
  'Weight Loss', 'Muscle Gain', 'Bodybuilding', 'Strength', 'HIIT',
  'Yoga', 'Pilates', 'CrossFit', 'Sports Conditioning', 'Nutrition Coaching',
  'Powerlifting', 'Functional Training', 'Boxing', 'Mobility', 'Rehabilitation'
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

/** HD fitness portraits — Unsplash 1200px, high quality */
const MALE_HD_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1200&q=85&auto=format&fit=crop'
];

const FEMALE_HD_IMAGES = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=85&auto=format&fit=crop'
];

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
  'Ali Hassan', 'Omar Sheikh', 'Noman Javed', 'Saad Qayyum', 'Waqas Rafiq',
  'Hassan Raza', 'Junaid Akram', 'Shahzaib Malik', 'Adnan Siddiqui', 'Rizwan Haider',
  'Farhan Abbasi', 'Mubashir Iqbal', 'Danish Tariq', 'Arslan Butt', 'Yasir Mehmood',
  'Adeel Hussain', 'Babar Azam Khan', 'Shoaib Mirza', 'Fahad Sheikh', 'Haroon Rashid',
  'Marcus Vane', 'Zain Ul Abideen', 'Raheel Anwar', 'Sarmad Ali', 'Umer Farooq',
  'Asad Mahmood', 'Talha Bin Zaid', 'Moiz Ahmed', 'Rehan Qureshi', 'Haris Nadeem',
];

const femaleNames = [
  'Ayesha Amin', 'Fatima Noor', 'Sana Malik', 'Zara Haider', 'Hira Tareen',
  'Nida Yasir', 'Sadia Khan', 'Mahnoor Baloch', 'Kiran Haq', 'Anam Fayyaz',
  'Rabia Chaudhry', 'Zainab Abbas', 'Iram Parveen', 'Fiza Ali', 'Sonia Hussain',
  'Amna Sheikh', 'Laiba Khan', 'Mariam Siddiqui', 'Hania Amir', 'Saba Qamar',
  'Nimra Ahmed', 'Areeba Malik', 'Dua Zahra', 'Mehwish Tariq', 'Sana Javed',
  'Alina Hassan', 'Bushra Ansari', 'Cyra Noor', 'Eman Ali', 'Farah Khan',
  'Sofia Ahmed', 'Tania Malik', 'Urooj Fatima', 'Vaneeza Ansari', 'Wajiha Khan',
  'Yumna Zaidi', 'Zoya Nasir', 'Aisha Rahman', 'Benish Khan', 'Chandni Roy',
];

const trainersData = [];

maleNames.forEach((name, index) => {
  trainersData.push(createTrainerObject(name, 'Male', MALE_HD_IMAGES[index % MALE_HD_IMAGES.length], index));
});

femaleNames.forEach((name, index) => {
  trainersData.push(createTrainerObject(name, 'Female', FEMALE_HD_IMAGES[index % FEMALE_HD_IMAGES.length], index));
});

function createTrainerObject(fullName, gender, profileImage, index) {
  const id = fullName.toLowerCase().replace(/ /g, '-');
  const expYears = randomInt(2, 18);
  const specs = generateRandomItems(specializationsPool, 1, 3);
  const mainSpec = specs[0];
  const rating = parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1));
  const reviews = randomInt(12, 850);
  const price = randomInt(2500, 12000);
  const city = generateRandomItem(cities);
  const bio = `Hi, I am ${fullName}, a certified fitness coach based in ${city}. With ${expYears}+ years specializing in ${specs.join(', ')}, I help clients build strength, confidence, and sustainable habits through personalized programming.`;

  return {
    fullName,
    profileImage,
    biography: bio,
    specializations: specs,
    experienceYears: expYears,
    qualifications: generateRandomItem(qualificationsList),
    certifications: generateRandomItems(certificationsList, 1, 3),
    languages: ['Urdu', 'English', ...generateRandomItems(languagesList.slice(2), 0, 1)],
    totalReviews: reviews,
    city,
    country: 'Pakistan',
    hourlyPrice: price,
    availabilityStatus: generateRandomItem(availabilityStatuses),
    weeklySchedule: {
      Monday: '09:00 AM - 06:00 PM',
      Tuesday: '09:00 AM - 06:00 PM',
      Wednesday: '09:00 AM - 06:00 PM',
      Thursday: '09:00 AM - 06:00 PM',
      Friday: '09:00 AM - 05:00 PM',
      Saturday: '10:00 AM - 02:00 PM',
      Sunday: 'Off'
    },
    verifiedTrainer: index % 4 !== 0,
    featuredTrainer: index % 5 === 0,
    id,
    name: fullName,
    gender,
    specialization: mainSpec,
    experience: `${expYears} years`,
    expertise: specs.join(', '),
    status: 'Available',
    image: profileImage,
    accentColor: generateRandomItem(colors),
    bio,
    recommendedFor: `Clients focused on ${mainSpec} and long-term fitness results.`,
    supportNote: `Book a session and let's build your best version together!`,
    rating
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
    const skippedCount = bulkOps.length - upsertedCount - modifiedCount;
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('--- Seeding Results ---');
    console.log(`Total Trainers Processed: ${bulkOps.length}`);
    console.log(`Newly Inserted: ${upsertedCount}`);
    console.log(`Updated: ${modifiedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Execution Time: ${executionTime}s`);
    console.log('-----------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedTrainers();
