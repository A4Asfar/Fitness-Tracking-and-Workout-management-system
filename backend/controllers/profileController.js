const User = require('../models/User');
const Workout = require('../models/Workout');
const MealSelection = require('../models/MealSelection');
const TrainerConsult = require('../models/TrainerConsult');
const { asyncHandler } = require('../middleware/errorMiddleware');

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
    { new: true }
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
    { new: true }
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
  // Count unique days as total workouts to match workoutController logic, or just raw length
  const totalWorkouts = new Set(workouts.map(w => new Date(w.date).toISOString().split('T')[0])).size;
  
  let totalVolume = 0;
  workouts.forEach(w => {
    totalVolume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
  });

  // Calculate generic Calories Burned estimate (e.g. 250 base + volume factor)
  const caloriesBurnedEstimate = Math.round(totalWorkouts * 250 + (totalVolume * 0.05));

  // 2. Meals & Consults
  const totalMeals = meals.length;
  const totalConsultations = consults.length;

  // 3. BMI Calculation
  let bmi = 0;
  let bmiCategory = 'N/A';
  if (user && user.weight && user.height) {
    const heightInMeters = user.height / 100;
    bmi = parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 24.9) bmiCategory = 'Normal';
    else if (bmi < 29.9) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
  }

  // 4. Weekly Activity Score (0-100)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWorkouts = new Set(workouts.filter(w => new Date(w.date) >= sevenDaysAgo).map(w => new Date(w.date).toISOString().split('T')[0])).size;
  // 4 workouts a week is a perfect 100 score
  let activityScore = Math.min(Math.round((recentWorkouts / 4) * 100), 100);

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
