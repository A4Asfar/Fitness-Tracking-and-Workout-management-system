require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

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

async function fixImages() {
  if (!process.env.MONGO_URI) {
    console.error('NO MONGO_URI');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  const trainers = await db.collection('trainers').find({}).toArray();
  let updated = 0;
  for (let i = 0; i < trainers.length; i++) {
    const t = trainers[i];
    let newImage = '';
    if (t.gender === 'Female') {
      newImage = FEMALE_HD_IMAGES[i % FEMALE_HD_IMAGES.length];
    } else {
      newImage = MALE_HD_IMAGES[i % MALE_HD_IMAGES.length];
    }
    await db.collection('trainers').updateOne(
      { _id: t._id },
      { $set: { profileImage: newImage, image: newImage } }
    );
    updated++;
  }
  console.log('Updated', updated, 'trainers');
  process.exit(0);
}
fixImages();
