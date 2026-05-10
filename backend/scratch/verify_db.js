require('dotenv').config();
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Workout = require('../models/Workout');
const Trainer = require('../models/Trainer');
const WorkoutSuggestion = require('../models/WorkoutSuggestion');
const ChatHistory = require('../models/ChatHistory');
const ChatKnowledge = require('../models/ChatKnowledge');
const MealSelection = require('../models/MealSelection');
const TrainerConsult = require('../models/TrainerConsult');
const Notification = require('../models/Notification');
const WeightLog = require('../models/WeightLog');

async function verify() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!\n');

    const collections = [
      { name: 'Users', model: User },
      { name: 'Workouts', model: Workout },
      { name: 'Trainers', model: Trainer },
      { name: 'Workout Suggestions', model: WorkoutSuggestion },
      { name: 'Chat History', model: ChatHistory },
      { name: 'Chat Knowledge', model: ChatKnowledge },
      { name: 'Meal Selections', model: MealSelection },
      { name: 'Trainer Consultations', model: TrainerConsult },
      { name: 'Notifications', model: Notification },
      { name: 'Weight Logs', model: WeightLog }
    ];

    console.log('📊 COLLECTION STATISTICS:');
    console.log('--------------------------------------------------');
    for (const col of collections) {
      const count = await col.model.countDocuments();
      console.log(`${col.name.padEnd(25)} : ${count} documents`);
    }
    console.log('--------------------------------------------------\n');

    // Sample data from key collections
    console.log('✨ SAMPLE DATA PREVIEW:');
    
    console.log('\n--- TRAINERS (Sample) ---');
    const trainers = await Trainer.find().limit(2);
    trainers.forEach(t => console.log(`- ${t.name} (${t.expertise})`));

    console.log('\n--- WORKOUT SUGGESTIONS (Sample) ---');
    const suggestions = await WorkoutSuggestion.find().limit(2);
    suggestions.forEach(s => console.log(`- [${s.level}] ${s.exercise}: ${s.reason}`));

    console.log('\n--- CHAT KNOWLEDGE (Sample) ---');
    const knowledge = await ChatKnowledge.find().limit(2);
    knowledge.forEach(k => console.log(`- Category: ${k.category} (${k.keywords.slice(0,3).join(', ')}...)`));

    if (await User.countDocuments() > 0) {
      console.log('\n--- RECENT USERS ---');
      const users = await User.find().sort({ createdAt: -1 }).limit(3);
      users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.membershipType}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error verifying database:', err.message);
    process.exit(1);
  }
}

verify();
