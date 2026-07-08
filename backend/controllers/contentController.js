const Meal = require('../models/Meal');
const { generateContentWithFallback } = require('../utils/geminiHelper');
const { asyncHandler } = require('../middleware/errorMiddleware');
const DailyPlan = require('../models/DailyPlan');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const WorkoutSuggestion = require('../models/WorkoutSuggestion');
const { resolveTrainer } = require('../utils/trainerHelper');
const { getLocalDateString } = require('../utils/dateUtils');

const getMotivation = (goal) => {
  const notes = [
    'Consistency is the key to unlocking your true potential.',
    'Small steps every day lead to massive results over time.',
    'Your only competition is the person you were yesterday.',
    'Hydration is just as important as your workout. Drink up!',
    'Recovery is where the growth happens. Don\'t skip your rest.',
    'Fuel your body with intention, not just convenience.',
    'The hardest part is showing up. You\'ve already won half the battle.',
    'Focus on form over speed. Quality builds longevity.'
  ];
  if (goal?.includes('Loss')) {
    notes.push('Every healthy choice counts towards your deficit.');
    notes.push('Focus on fiber and water to stay satiated today.');
  } else if (goal?.includes('Gain')) {
    notes.push('Ensure you hit your protein targets for optimal repair.');
    notes.push('Progressive overload is your best friend this week.');
  }
  return notes[Math.floor(Math.random() * notes.length)];
};

exports.getTrainers = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find({}).sort({ featuredTrainer: -1, rating: -1, fullName: 1 });
  res.json(trainers);
});

exports.getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await resolveTrainer(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  res.json(trainer);
});

exports.getDailyPlan = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const generatedDate = getLocalDateString(new Date());

  // 1. Check if plan already exists for today
  let plan = await DailyPlan.findOne({ userId, generatedDate });
  if (plan) {
    return res.json(plan);
  }

  // 2. Generate a new plan dynamically
  const goal = user.fitnessGoal || 'general_fitness';
  const level = user.trainingLevel || 'Beginner';
  const weight = user.weight || 70;

  const prompt = `Generate a daily fitness and nutrition routine for a user with the following details:
- Goal: ${goal}
- Training Level: ${level}
- Current Weight: ${weight} kg
- Workout Focus Preference: ${user.workoutFocus || 'General'}

Your response MUST be a single, valid raw JSON object. Do not wrap it in markdown code blocks or add any other text. The JSON structure must match this exact format:
{
  "estimatedCalories": 350,
  "warmup": [
    { "exercise": "Jumping Jacks", "duration": "2 mins" },
    { "exercise": "Arm Circles", "duration": "1 min" }
  ],
  "exercises": [
    { "name": "Push Ups", "sets": 3, "reps": "12", "rest": "60s", "notes": "Keep core tight", "icon": "Dumbbell" },
    { "name": "Bodyweight Squats", "sets": 3, "reps": "15", "rest": "60s", "notes": "Go parallel", "icon": "Dumbbell" }
  ],
  "nutrition": {
    "breakfast": "Egg White Omelet with spinach",
    "lunch": "Grilled Chicken Salad",
    "dinner": "Baked Salmon and asparagus",
    "snack": "Greek Yogurt with blueberries",
    "hydration": "2.5 Liters",
    "proteinTarget": "140g"
  },
  "recovery": "10 mins of full body stretching focusing on hamstrings and calves.",
  "motivation": "Consistency beats intensity every single time."
}`;

  let result;
  try {
    result = await generateContentWithFallback(prompt);
  } catch (err) {
    console.error('❌ Gemini Error (getDailyPlan):', err.message);
    res.status(503);
    throw new Error('AI service is temporarily busy. Please try again shortly.');
  }

  // Strip any Gemini preamble or markdown code fences
  let responseText = result.text.trim();
  if (responseText.startsWith('🤖 FitAI Active')) {
    responseText = responseText.replace('🤖 FitAI Active', '').trim();
  }
  if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  // Safe JSON parse — return 503 with a friendly message if Gemini returns invalid JSON
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (parseErr) {
    console.error('❌ Daily plan JSON parse failed. Raw response:', responseText.substring(0, 500));
    res.status(503);
    throw new Error('AI returned an unexpected response. Please try again shortly.');
  }

  const estimatedCalories = parsed.estimatedCalories || 300;
  const warmup = parsed.warmup || [];
  const exercises = parsed.exercises || [];
  const recovery = parsed.recovery || 'Rest and recover.';
  const motivation = parsed.motivation || getMotivation(goal);

  const breakfast = parsed.nutrition?.breakfast || 'Healthy breakfast';
  const lunch = parsed.nutrition?.lunch || 'Healthy lunch';
  const dinner = parsed.nutrition?.dinner || 'Healthy dinner';
  const snack = parsed.nutrition?.snack || 'Healthy snack';
  const hydration = parsed.nutrition?.hydration || '2.0 Liters';
  const proteinTarget = parsed.nutrition?.proteinTarget || '100g';

  plan = new DailyPlan({
    userId,
    generatedDate,
    goalType: goal,
    level,
    estimatedCalories,
    warmup,
    exercises,
    nutrition: { breakfast, lunch, dinner, snack, hydration, proteinTarget },
    recovery,
    motivation
  });

  try {
    await plan.save();
  } catch (saveErr) {
    if (saveErr.code === 11000) {
      plan = await DailyPlan.findOne({ userId, generatedDate });
      if (plan) {
        return res.json(plan);
      }
    }
    throw saveErr;
  }

  try {
    const { createInAppNotification } = require('./notificationController');
    await createInAppNotification(
      userId,
      'Daily Plan Ready! 🌟',
      'Your personalized AI Workout and Diet plan for today is ready. Tap to view details.',
      'AI Daily Plan Ready',
      'bell',
      '/daily-plan'
    );
  } catch (err) {
    console.log('Error creating plan ready notification:', err.message);
  }

  console.log(`🤖 Generated new AI Daily Plan for user ${userId} on ${generatedDate}`);

  res.json(plan);
});

exports.getNutritionSuggestions = asyncHandler(async (req, res) => {
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
});

exports.getMealByName = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = await Meal.findOne({ mealName: new RegExp(`^${escapedName}$`, 'i') });
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
  res.status(404);
  throw new Error('Meal not found');
});

exports.getWorkoutSuggestions = asyncHandler(async (req, res) => {
  const { level, focus } = req.query;
  const safeLevel = level || 'Beginner';
  const safeFocus = focus || 'Strength';

  const normalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const suggestions = await WorkoutSuggestion.find({
    level: normalize(safeLevel),
    focus: normalize(safeFocus)
  });

  if (suggestions.length === 0) {
    const levelSuggestions = await WorkoutSuggestion.find({ level: normalize(safeLevel) });
    return res.json(levelSuggestions);
  }

  res.json(suggestions);
});
