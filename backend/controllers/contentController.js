const Meal = require('../models/Meal');
const DailyPlan = require('../models/DailyPlan');
const User = require('../models/User');
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
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const generatedDate = new Date().toISOString().split('T')[0];
    
    // 1. Check if plan already exists for today
    let plan = await DailyPlan.findOne({ userId, generatedDate });
    if (plan) {
      return res.json(plan);
    }

    // 2. Generate a new plan dynamically
    const goal = user.fitnessGoal || 'general_fitness';
    const level = user.trainingLevel || 'beginner';
    const weight = user.weight || 70; // fallback 70kg
    
    // Customize based on goal
    let estimatedCalories = 0;
    let warmup = [];
    let exercises = [];
    let recovery = "";
    let proteinTarget = "";
    let motivation = getMotivation(goal);

    if (goal === 'weight_loss') {
      estimatedCalories = Math.round(weight * 6.5);
      warmup = [
        { exercise: 'Jumping Jacks', duration: '2 mins' },
        { exercise: 'High Knees', duration: '1 min' },
        { exercise: 'Arm Circles', duration: '1 min' }
      ];
      exercises = [
        { name: 'Burpees', sets: 4, reps: '15', rest: '45s', notes: 'Keep a fast pace', icon: 'Flame' },
        { name: 'Mountain Climbers', sets: 4, reps: '20 each leg', rest: '45s', notes: 'Keep hips low', icon: 'Zap' },
        { name: 'Jump Squats', sets: 3, reps: '15', rest: '60s', notes: 'Explosive jump', icon: 'Zap' },
        { name: 'Plank', sets: 3, reps: '60s', rest: '30s', notes: 'Core tight', icon: 'Dumbbell' }
      ];
      recovery = "10 minutes of light walking followed by full-body stretching focusing on legs.";
      proteinTarget = `${Math.round(weight * 1.6)}g`;
    } else if (goal === 'muscle_gain') {
      estimatedCalories = Math.round(weight * 4.5);
      warmup = [
        { exercise: 'Dynamic Stretching', duration: '3 mins' },
        { exercise: 'Light Pushups', duration: '1 min' },
        { exercise: 'Bodyweight Squats', duration: '2 mins' }
      ];
      exercises = [
        { name: 'Bench Press / Push Ups', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on slow eccentric', icon: 'Dumbbell' },
        { name: 'Pull Ups / Rows', sets: 4, reps: '8-10', rest: '90s', notes: 'Squeeze back at the top', icon: 'Dumbbell' },
        { name: 'Heavy Squats', sets: 4, reps: '6-8', rest: '120s', notes: 'Go deep and explode up', icon: 'Dumbbell' },
        { name: 'Overhead Press', sets: 3, reps: '8-10', rest: '90s', notes: 'Keep core tight', icon: 'Dumbbell' }
      ];
      recovery = "Consume a protein shake within 30 minutes. Focus on static stretching for the chest and shoulders.";
      proteinTarget = `${Math.round(weight * 2.2)}g`;
    } else {
      estimatedCalories = Math.round(weight * 5.5);
      warmup = [
        { exercise: 'Light Jog in Place', duration: '2 mins' },
        { exercise: 'Arm Circles', duration: '1 min' },
        { exercise: 'Hip Rotations', duration: '1 min' }
      ];
      exercises = [
        { name: 'Push Ups', sets: 3, reps: '12', rest: '60s', notes: 'Full range of motion', icon: 'Dumbbell' },
        { name: 'Walking Lunges', sets: 3, reps: '10 each leg', rest: '60s', notes: 'Keep torso upright', icon: 'Dumbbell' },
        { name: 'Dumbbell Rows', sets: 3, reps: '12', rest: '60s', notes: 'Pull to the hip', icon: 'Dumbbell' },
        { name: 'Bicycle Crunches', sets: 3, reps: '20', rest: '45s', notes: 'Twist fully', icon: 'Zap' }
      ];
      recovery = "5 minutes of yoga flows (Downward Dog to Cobra). Stay active the rest of the day.";
      proteinTarget = `${Math.round(weight * 1.8)}g`;
    }

    // Add daily variation (simple reverse based on day of week to prevent static feeling)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek % 2 !== 0 && exercises.length > 0) {
      exercises.reverse();
    }

    // Nutrition
    const dbMeals = await Meal.find({});
    const randomNutrition = [...dbMeals].sort(() => 0.5 - Math.random());
    const getMeal = (cat) => randomNutrition.find(m => m.category === cat)?.mealName || `Healthy ${cat}`;

    const nutrition = {
      breakfast: getMeal('Breakfast'),
      lunch: getMeal('Lunch'),
      dinner: getMeal('Dinner'),
      snack: getMeal('Snack'),
      hydration: `${(weight * 0.033).toFixed(1)} Liters`,
      proteinTarget
    };

    // 3. Save to MongoDB
    plan = new DailyPlan({
      userId,
      generatedDate,
      goalType: goal,
      level,
      estimatedCalories,
      warmup,
      exercises,
      nutrition,
      recovery,
      motivation
    });
    
    await plan.save();
    console.log(`🤖 Generated new AI Daily Plan for user ${userId} on ${generatedDate}`);

    res.json(plan);
  } catch (error) {
    console.error('Daily plan generation error:', error);
    res.status(500).json({ message: 'Server error generating plan' });
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
