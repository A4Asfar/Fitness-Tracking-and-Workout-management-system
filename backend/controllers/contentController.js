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
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/strength_coach_marcus_1777902991716.png',
    accentColor: '#CCFF00',
    bio: 'Marcus has spent over a decade training elite athletes and powerlifters. His philosophy centers on progressive overload and bulletproof form to ensure long-term health and massive gains.',
    recommendedFor: 'Building raw strength, mass gain, and technical lifting refinement.',
    supportNote: 'I focus on the "why" behind every lift. Ready to break your PRs?'
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    gender: 'Female',
    specialization: 'Cardio Coach',
    experience: '8 years',
    expertise: 'HIIT & Marathon Prep',
    status: 'Available',
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/cardio_specialist_sarah_1777903009566.png',
    accentColor: '#00D1FF',
    bio: 'Sarah is a certified endurance specialist who believes that cardiovascular health is the foundation of all fitness. She designs programs that boost metabolic rate and heart health simultaneously.',
    recommendedFor: 'Fat loss, heart health, and endurance training for all levels.',
    supportNote: "Consistency beats intensity every time. Let's build your engine."
  },
  {
    id: 'viktor-steel',
    name: 'Viktor Steel',
    gender: 'Male',
    specialization: 'Bodybuilding Coach',
    experience: '15 years',
    expertise: 'Hypertrophy & Aesthetics',
    status: 'Available',
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/bodybuilding_coach_viktor_1777903460589.png',
    accentColor: '#FF4B4B',
    bio: 'Viktor is a former competitive bodybuilder with a passion for sculpting physiques. He combines old-school intensity with modern sports science to help clients achieve their ultimate aesthetic potential.',
    recommendedFor: 'Muscle hypertrophy, symmetry, and competition prep.',
    supportNote: "Discipline is the bridge between goals and accomplishment. Let's sculpt your best self."
  },
  {
    id: 'elena-rossi',
    name: 'Elena Rossi',
    gender: 'Female',
    specialization: 'Yoga Trainer',
    experience: '12 years',
    expertise: 'Mobility & Mindfulness',
    status: 'Busy',
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/yoga_trainer_elena_1777903026279.png',
    accentColor: '#A855F7',
    bio: 'With 12 years of practice in Hatha and Vinyasa Yoga, Elena helps athletes find balance through mobility and mindful recovery techniques.',
    recommendedFor: 'Active recovery, flexibility, and stress management.',
    supportNote: "Your body needs rest as much as it needs work. Let's find your flow."
  },
  {
    id: 'david-miller',
    name: 'David Miller',
    gender: 'Male',
    specialization: 'Nutrition Coach',
    experience: '7 years',
    expertise: 'Performance Fueling',
    status: 'Available',
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/nutrition_coach_david_1777903053693.png',
    accentColor: '#FFD700',
    bio: 'David combines sports science with practical nutrition to help clients fuel their workouts and recover faster without restrictive dieting.',
    recommendedFor: 'Fat loss, performance fueling, and healthy habit building.',
    supportNote: "Food is fuel, not the enemy. Let's optimize your plate."
  },
  {
    id: 'maya-soul',
    name: 'Maya Soul',
    gender: 'Female',
    specialization: 'Wellness Trainer',
    experience: '9 years',
    expertise: 'Holistic Health & Longevity',
    status: 'Available',
    image: 'file:///C:/Users/pc%20planet/.gemini/antigravity/brain/cf750c50-2e2f-4e7a-9b6b-9adc58c29b38/wellness_trainer_maya_1777903475361.png',
    accentColor: '#39FF14',
    bio: 'Maya focuses on the connection between mind, body, and spirit. Her holistic approach ensures that fitness is sustainable and integrated into a balanced lifestyle for long-term longevity.',
    recommendedFor: 'Stress reduction, habit formation, and lifestyle optimization.',
    supportNote: "Wellness is a journey, not a destination. Let's make it a beautiful one."
  }
];

const WORKOUT_DATABASE = {
  'Beginner': {
    'Strength': [
      { exercise: 'Push Ups', reason: 'Master your bodyweight for upper body power.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Bodyweight Squats', reason: 'Build foundational leg strength and mobility.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Plank', reason: 'Critical for developing core stability early on.', type: 'Strength', icon: 'Zap' },
    ],
    'Cardio': [
      { exercise: 'Brisk Walking', reason: 'Safe and effective way to build aerobic capacity.', type: 'Cardio', icon: 'Flame' },
      { exercise: 'Light Jogging', reason: 'Introduce higher heart rate intervals slowly.', type: 'Cardio', icon: 'Flame' },
    ],
    'HIIT': [
      { exercise: 'Jumping Jacks', reason: 'Full body movement to improve coordination.', type: 'HIIT', icon: 'Zap' },
    ]
  },
  'Intermediate': {
    'Strength': [
      { exercise: 'Bench Press', reason: 'Compound lift for significant chest and tricep growth.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Deadlift', reason: 'King of all exercises for overall body strength.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Pull Ups', reason: 'Build an impressive back and grip strength.', type: 'Strength', icon: 'Dumbbell' },
    ],
    'Cardio': [
      { exercise: 'HIIT Sprints', reason: 'Boost metabolic rate and cardiovascular health.', type: 'HIIT', icon: 'Zap' },
      { exercise: 'Jump Rope', reason: 'Elite level conditioning and footwork.', type: 'Cardio', icon: 'Flame' },
    ],
    'Yoga': [
      { exercise: 'Sun Salutations', reason: 'Great for active recovery and flexibility.', type: 'Yoga', icon: 'Trophy' },
    ]
  },
  'Advanced': {
    'Strength': [
      { exercise: 'Weighted Pull Ups', reason: 'Take your pull strength to the absolute limit.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Overhead Press', reason: 'Master stability and power in the vertical plane.', type: 'Strength', icon: 'Dumbbell' },
    ],
    'HIIT': [
      { exercise: 'Mountain Climbers', reason: 'Explosive core and heart rate management.', type: 'HIIT', icon: 'Zap' },
      { exercise: 'Burpees', reason: 'The ultimate test of conditioning and power.', type: 'HIIT', icon: 'Zap' },
    ]
  }
};

const getMotivation = (goal) => {
  const notes = [
    "Consistency is the key to unlocking your true potential.",
    "Small steps every day lead to massive results over time.",
    "Your only competition is the person you were yesterday.",
    "Hydration is just as important as your workout. Drink up!",
    "Recovery is where the growth happens. Don't skip your rest.",
    "Fuel your body with intention, not just convenience.",
    "The hardest part is showing up. You've already won half the battle.",
    "Focus on form over speed. Quality builds longevity."
  ];
  if (goal?.includes('Loss')) {
    notes.push("Every healthy choice counts towards your deficit.");
    notes.push("Focus on fiber and water to stay satiated today.");
  } else if (goal?.includes('Gain')) {
    notes.push("Ensure you hit your protein targets for optimal repair.");
    notes.push("Progressive overload is your best friend this week.");
  }
  return notes[Math.floor(Math.random() * notes.length)];
};

exports.getTrainers = async (req, res) => {
  try {
    res.json(TRAINERS);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrainerById = async (req, res) => {
  try {
    const trainer = TRAINERS.find(t => t.id === req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDailyPlan = async (req, res) => {
  try {
    const { goal, level, focus } = req.query;
    
    // Nutrition Plan from DB
    let query = {};
    if (goal?.includes('Loss')) query.recommendedFor = 'Weight Loss';
    else if (goal?.includes('Gain')) query.recommendedFor = 'Muscle Gain';
    else if (goal?.includes('Maintain')) query.recommendedFor = 'Maintain Fitness';
    else if (goal?.includes('Endurance')) query.recommendedFor = 'Endurance';
    
    const dbMeals = await Meal.find(query);
    const nutritionList = dbMeals.length > 0 ? dbMeals : await Meal.find({}); // Fallback to all if goal not found
    
    const randomNutrition = [...nutritionList].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    const nutritionPlan = {};
    ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach(type => {
      const match = randomNutrition.find(s => s.category === type) || 
                    nutritionList.find(s => s.category === type) || 
                    nutritionList[0];
      
      // Map DB fields to what frontend expects if necessary
      nutritionPlan[type] = match ? {
        name: match.mealName,
        note: match.benefit || 'Optimized for your goals.',
        type: match.category,
        icon: match.icon,
        calories: match.calories,
        protein: match.protein,
        carbs: match.carbs,
        fats: match.fats,
        benefit: match.benefit
      } : null;
    });

    // Workout Plan
    const safeLevel = level || 'Beginner';
    const safeFocus = focus || 'Strength';
    const levelGroup = WORKOUT_DATABASE[safeLevel] || WORKOUT_DATABASE['Beginner'];
    let workoutSuggestions = levelGroup[safeFocus] || levelGroup['Strength'] || [];
    
    if (workoutSuggestions.length < 2) {
      const fallback = levelGroup['Strength'] || [];
      workoutSuggestions = [...workoutSuggestions, ...fallback.filter(s => !workoutSuggestions.includes(s))];
    }
    
    workoutSuggestions = [...workoutSuggestions].sort(() => 0.5 - Math.random()).slice(0, 3);

    res.json({
      nutritionPlan,
      workoutSuggestions,
      motivation: getMotivation(goal)
    });
  } catch (error) {
    console.error('Daily plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNutritionSuggestions = async (req, res) => {
  try {
    const { goal } = req.query;
    let query = {};
    if (goal?.includes('Loss')) query.recommendedFor = 'Weight Loss';
    else if (goal?.includes('Gain')) query.recommendedFor = 'Muscle Gain';
    else if (goal?.includes('Maintain')) query.recommendedFor = 'Maintain Fitness';
    else if (goal?.includes('Endurance')) query.recommendedFor = 'Endurance';
    
    const dbMeals = await Meal.find(query);
    const nutritionList = dbMeals.map(m => ({
      name: m.mealName,
      note: m.benefit || 'Perfect for your goal.',
      type: m.category,
      icon: m.icon,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
      benefit: m.benefit
    }));
    
    res.json(nutritionList);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMealByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const m = await Meal.findOne({ mealName: new RegExp(`^${name}$`, 'i') });
    if (m) {
      return res.json({
        name: m.mealName,
        note: m.benefit || 'Perfect for your goal.',
        type: m.category,
        icon: m.icon,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        benefit: m.benefit
      });
    }
    return res.status(404).json({ message: 'Meal not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWorkoutSuggestions = async (req, res) => {
  try {
    const { level, focus } = req.query;
    const safeLevel = level || 'Beginner';
    const safeFocus = focus || 'Strength';
    const levelGroup = WORKOUT_DATABASE[safeLevel] || WORKOUT_DATABASE['Beginner'];
    let suggestions = levelGroup[safeFocus] || levelGroup['Strength'] || [];
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
