require('dotenv').config();
const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');
const WorkoutSuggestion = require('../models/WorkoutSuggestion');
const Meal = require('../models/Meal');

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

const MEALS = [
  // Weight Loss
  { mealName: 'Egg White Omelet', category: 'Breakfast', calories: 180, protein: 24, carbs: 4, fats: 6, recommendedFor: 'Weight Loss', benefit: 'Egg whites provide high-quality leucine for muscle preservation while keeping caloric density extremely low.', icon: 'Coffee' },
  { mealName: 'Grilled Chicken Salad', category: 'Lunch', calories: 320, protein: 35, carbs: 12, fats: 14, recommendedFor: 'Weight Loss', benefit: 'Lean poultry and dark leafy greens maximize satiety through high volume and protein-induced thermogenesis.', icon: 'Sun' },
  { mealName: 'Baked Salmon & Asparagus', category: 'Dinner', calories: 410, protein: 32, carbs: 8, fats: 22, recommendedFor: 'Weight Loss', benefit: 'Essential fatty acids support hormonal health while the low-glycemic vegetable base prevents insulin spikes.', icon: 'Moon' },
  { mealName: 'Greek Yogurt & Berries', category: 'Snack', calories: 160, protein: 18, carbs: 15, fats: 2, recommendedFor: 'Weight Loss', benefit: 'Antioxidants from berries combined with slow-digesting casein protein prevent mid-day muscle breakdown.', icon: 'Apple' },

  // Muscle Gain
  { mealName: 'Steak & Eggs', category: 'Breakfast', calories: 650, protein: 48, carbs: 2, fats: 42, recommendedFor: 'Muscle Gain', benefit: 'Saturated fats and cholesterol from high-quality beef support natural testosterone production for growth.', icon: 'Coffee' },
  { mealName: 'Beef & Quinoa Bowl', category: 'Lunch', calories: 580, protein: 42, carbs: 55, fats: 18, recommendedFor: 'Muscle Gain', benefit: 'Quinoa provides a complete amino acid profile alongside slow-release carbs to fuel heavy lifting sessions.', icon: 'Sun' },
  { mealName: 'Chicken & Sweet Potato', category: 'Dinner', calories: 520, protein: 40, carbs: 62, fats: 8, recommendedFor: 'Muscle Gain', benefit: 'Sweet potatoes are an excellent source of Vitamin A and potassium, essential for electrolyte balance and recovery.', icon: 'Moon' },
  { mealName: 'Protein Shake & Nut Butter', category: 'Snack', calories: 340, protein: 30, carbs: 12, fats: 22, recommendedFor: 'Muscle Gain', benefit: 'The combination of whey protein and monounsaturated fats provides a sustained release of nutrients.', icon: 'Zap' },

  // Maintain Fitness
  { mealName: 'Avocado Toast & Egg', category: 'Breakfast', calories: 380, protein: 16, carbs: 32, fats: 24, recommendedFor: 'Maintain Fitness', benefit: 'Monounsaturated fats from avocado support brain health and steady energy throughout the morning.', icon: 'Coffee' },
  { mealName: 'Turkey & Veggie Wrap', category: 'Lunch', calories: 420, protein: 28, carbs: 45, fats: 12, recommendedFor: 'Maintain Fitness', benefit: 'A balanced ratio of macros ensures you stay energized without feeling heavy or sluggish.', icon: 'Sun' },

  // Endurance
  { mealName: 'Oatmeal & Banana', category: 'Breakfast', calories: 320, protein: 12, carbs: 62, fats: 6, recommendedFor: 'Endurance', benefit: 'Oats provide beta-glucan fiber for sustained energy release during long endurance sessions.', icon: 'Coffee' },
  { mealName: 'Pasta with Pesto', category: 'Lunch', calories: 550, protein: 18, carbs: 85, fats: 16, recommendedFor: 'Endurance', benefit: 'High carbohydrate density ensures glycogen stores are topped up for high-intensity endurance work.', icon: 'Sun' },
  { mealName: 'Brown Rice & Stir-fry', category: 'Dinner', calories: 480, protein: 22, carbs: 70, fats: 10, recommendedFor: 'Endurance', benefit: 'Complex carbs and diverse micronutrients from vegetables support systemic recovery.', icon: 'Moon' },
  { mealName: 'Energy Bar', category: 'Snack', calories: 220, protein: 6, carbs: 38, fats: 8, recommendedFor: 'Endurance', benefit: 'Simple sugars provide immediate glucose for the brain and muscles during metabolic stress.', icon: 'Zap' },

  // General Fitness
  { mealName: 'Scrambled Eggs & Fruit', category: 'Breakfast', calories: 280, protein: 18, carbs: 22, fats: 14, recommendedFor: 'General Fitness', benefit: 'A perfect balance of whole protein and natural sugars to wake up your metabolism.', icon: 'Coffee' },
  { mealName: 'Mixed Grain Bowl', category: 'Lunch', calories: 450, protein: 24, carbs: 55, fats: 16, recommendedFor: 'General Fitness', benefit: 'Fiber-rich grains and seeds support gut health and provide steady energy for the afternoon.', icon: 'Sun' },
  { mealName: 'Lean Protein & Veggies', category: 'Dinner', calories: 380, protein: 35, carbs: 15, fats: 12, recommendedFor: 'General Fitness', benefit: 'High protein and low carb dinner prevents excessive calorie storage before sleep.', icon: 'Moon' },
  { mealName: 'Mixed Nuts', category: 'Snack', calories: 190, protein: 7, carbs: 6, fats: 16, recommendedFor: 'General Fitness', benefit: 'Monounsaturated fats and vitamin E support cellular health and reduce inflammation.', icon: 'Apple' }
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

    await Meal.deleteMany({});
    await Meal.insertMany(MEALS);
    console.log('Seeded Meals');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
