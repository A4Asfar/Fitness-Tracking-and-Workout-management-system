const User = require('../models/User');
const Workout = require('../models/Workout');
const MealSelection = require('../models/MealSelection');
const TrainerConsult = require('../models/TrainerConsult');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getLocalDateString, calculateBMI } = require('../utils/dateUtils');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide name');
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar },
    { returnDocument: 'after' }
  ).select('-password');
  console.log('📝 Profile updated in MongoDB for user:', req.userId);
  res.json(user);
});

exports.upgradeProfile = asyncHandler(async (req, res) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 1 month subscription

  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      membershipType: 'premium',
      membershipExpiresAt: expiryDate
    },
    { returnDocument: 'after' }
  ).select('-password');
  console.log('👑 User upgraded to premium until:', expiryDate);
  res.json(user);
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const [user, workouts, meals, consults] = await Promise.all([
    User.findById(userId),
    Workout.find({ userId }),
    MealSelection.find({ userId }),
    TrainerConsult.find({ userId })
  ]);

  // 1. Calculate Workouts & Volume
  const totalWorkouts = new Set(workouts.map(w => getLocalDateString(w.date))).size;
  let totalVolume = 0;
  workouts.forEach(w => {
    totalVolume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
  });

  const caloriesBurnedEstimate = Math.round(totalWorkouts * 250 + (totalVolume * 0.05));

  // 2. Meals & Consults
  const totalMeals = meals.length;
  const totalConsultations = consults.length;

  // 3. BMI Calculation
  const { bmi, bmiCategory } = calculateBMI(user?.weight, user?.height);

  // 4. Weekly Activity Score (0–100)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWorkouts = new Set(
    workouts.filter(w => new Date(w.date) >= sevenDaysAgo).map(w => getLocalDateString(w.date))
  ).size;
  const activityScore = Math.min(Math.round((recentWorkouts / 4) * 100), 100);

  res.json({
    totalWorkouts,
    caloriesBurnedEstimate,
    totalMeals,
    totalConsultations,
    currentWeight: user?.weight || 0,
    bmi,
    bmiCategory,
    activityScore,
    fitnessGoal: user?.fitnessGoal || 'general_fitness',
    trainingLevel: user?.trainingLevel || 'beginner'
  });
});

