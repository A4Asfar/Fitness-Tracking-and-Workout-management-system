require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const WorkoutSuggestion = require('../models/WorkoutSuggestion');

const TRAINERS = [
  {
    id: 'marcus-vane',
    name: 'Marcus Vane',
    gender: 'Male',
    specialization: 'Strength Coach',
    experience: '10 years',
    expertise: 'Powerlifting & Explosive Strength',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    accentColor: '#CCFF00',
    bio: 'Marcus has spent over a decade training elite athletes and powerlifters. His philosophy centers on progressive overload and bulletproof form to ensure long-term health and massive gains.',
    recommendedFor: 'Building raw strength, mass gain, and technical lifting refinement.',
    supportNote: 'I focus on the "why" behind every lift. Ready to break your PRs?',
    rating: 4.9
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    gender: 'Female',
    specialization: 'Cardio Coach',
    experience: '8 years',
    expertise: 'HIIT & Marathon Prep',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1518611012118-2960c8badce0?w=400&q=80',
    accentColor: '#00D1FF',
    bio: 'Sarah is a certified endurance specialist who believes that cardiovascular health is the foundation of all fitness. She designs programs that boost metabolic rate and heart health simultaneously.',
    recommendedFor: 'Fat loss, heart health, and endurance training for all levels.',
    supportNote: "Consistency beats intensity every time. Let's build your engine.",
    rating: 4.8
  },
  {
    id: 'viktor-steel',
    name: 'Viktor Steel',
    gender: 'Male',
    specialization: 'Bodybuilding Coach',
    experience: '15 years',
    expertise: 'Hypertrophy & Aesthetics',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
    accentColor: '#FF4B4B',
    bio: 'Viktor is a former competitive bodybuilder with a passion for sculpting physiques. He combines old-school intensity with modern sports science to help clients achieve their ultimate aesthetic potential.',
    recommendedFor: 'Muscle hypertrophy, symmetry, and competition prep.',
    supportNote: "Discipline is the bridge between goals and accomplishment. Let's sculpt your best self.",
    rating: 5.0
  }
];

const SUGGESTIONS = [
  // Beginner
  { level: 'Beginner', focus: 'Strength', exercise: 'Push Ups', reason: 'Master your bodyweight for upper body power.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Beginner', focus: 'Strength', exercise: 'Bodyweight Squats', reason: 'Build foundational leg strength and mobility.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Beginner', focus: 'Strength', exercise: 'Plank', reason: 'Critical for developing core stability early on.', type: 'Strength', icon: 'Zap' },
  { level: 'Beginner', focus: 'Cardio', exercise: 'Brisk Walking', reason: 'Safe and effective way to build aerobic capacity.', type: 'Cardio', icon: 'Flame' },
  { level: 'Beginner', focus: 'Cardio', exercise: 'Light Jogging', reason: 'Introduce higher heart rate intervals slowly.', type: 'Cardio', icon: 'Flame' },
  { level: 'Beginner', focus: 'HIIT', exercise: 'Jumping Jacks', reason: 'Full body movement to improve coordination.', type: 'HIIT', icon: 'Zap' },
  
  // Intermediate
  { level: 'Intermediate', focus: 'Strength', exercise: 'Bench Press', reason: 'Compound lift for significant chest and tricep growth.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Intermediate', focus: 'Strength', exercise: 'Deadlift', reason: 'King of all exercises for overall body strength.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Intermediate', focus: 'Strength', exercise: 'Pull Ups', reason: 'Build an impressive back and grip strength.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Intermediate', focus: 'Cardio', exercise: 'HIIT Sprints', reason: 'Boost metabolic rate and cardiovascular health.', type: 'HIIT', icon: 'Zap' },
  { level: 'Intermediate', focus: 'Cardio', exercise: 'Jump Rope', reason: 'Elite level conditioning and footwork.', type: 'Cardio', icon: 'Flame' },
  { level: 'Intermediate', focus: 'Flexibility', exercise: 'Sun Salutations', reason: 'Great for active recovery and flexibility.', type: 'Yoga', icon: 'Trophy' },

  // Advanced
  { level: 'Advanced', focus: 'Strength', exercise: 'Weighted Pull Ups', reason: 'Take your pull strength to the absolute limit.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Advanced', focus: 'Strength', exercise: 'Overhead Press', reason: 'Master stability and power in the vertical plane.', type: 'Strength', icon: 'Dumbbell' },
  { level: 'Advanced', focus: 'HIIT', exercise: 'Mountain Climbers', reason: 'Explosive core and heart rate management.', type: 'HIIT', icon: 'Zap' },
  { level: 'Advanced', focus: 'HIIT', exercise: 'Burpees', reason: 'The ultimate test of conditioning and power.', type: 'HIIT', icon: 'Zap' }
];

const CHAT_KNOWLEDGE = [
  {
    category: 'weight loss',
    keywords: ['weight loss', 'lose weight', 'slimming', 'lose fat'],
    responses: [
      "To lose weight effectively, focus on a sustainable caloric deficit. Aim for 200-500 calories below maintenance.",
      "Weight loss is a marathon, not a sprint. Prioritize high-volume, low-calorie foods like leafy greens to stay full.",
      "Combine steady-state cardio with strength training to burn fat while preserving your hard-earned muscle mass."
    ]
  },
  {
    category: 'muscle gain',
    keywords: ['muscle gain', 'build muscle', 'bulking', 'hypertrophy', 'get big'],
    responses: [
      "Muscle growth requires progressive overload—try to add a little weight or an extra rep every single week.",
      "To build muscle, you need a slight caloric surplus. Focus on quality complex carbs and lean protein sources.",
      "Make sure you're getting enough sleep! Muscle isn't built in the gym; it's built while you recover and rest."
    ]
  },
  {
    category: 'general',
    keywords: ['general', 'fitness', 'advice'],
    responses: [
      "That's a great question! While it depends on your specific context, staying consistent with training and nutrition is the golden rule.",
      "The best plan is the one you can stick to. Focus on making small, sustainable changes to your daily routine.",
      "Every body is different, so listen to yours. Adjust your intensity and fuel based on how you're feeling and performing."
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Trainer.deleteMany({});
    await Trainer.insertMany(TRAINERS);
    console.log('Seeded Trainers');

    await WorkoutSuggestion.deleteMany({});
    await WorkoutSuggestion.insertMany(SUGGESTIONS);
    console.log('Seeded Workout Suggestions');

    const ChatKnowledge = require('../models/ChatKnowledge');
    await ChatKnowledge.deleteMany({});
    await ChatKnowledge.insertMany(CHAT_KNOWLEDGE);
    console.log('Seeded Chat Knowledge');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
