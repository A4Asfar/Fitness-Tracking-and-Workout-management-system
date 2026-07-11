const User = require('../models/User');
const Workout = require('../models/Workout');
const MealSelection = require('../models/MealSelection');
const TrainerConsult = require('../models/TrainerConsult');
const PremiumPayment = require('../models/PremiumPayment');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getLocalDateString, calculateBMI } = require('../utils/dateUtils');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar, bio } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide name');
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, weight, height, fitnessGoal, trainingLevel, workoutFocus, avatar, bio },
    { new: true }
  ).select('-password');
  console.log('📝 Profile updated in MongoDB for user:', req.userId);
  res.json(user);
});

exports.upgradeProfile = asyncHandler(async (req, res) => {
  res.status(403);
  throw new Error('Direct upgrade is disabled. Please submit payment proof via the premium checkout flow.');
});

exports.submitPaymentProof = asyncHandler(async (req, res) => {
  const { plan, paymentMethod, paymentNumber, screenshotUrl } = req.body;
  if (!plan || !paymentMethod || !screenshotUrl) {
    res.status(400);
    throw new Error('Please provide plan, paymentMethod and screenshot');
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const payment = await PremiumPayment.create({
    userId: req.userId,
    userName: user.name,
    userEmail: user.email,
    plan,
    paymentMethod,
    paymentNumber,
    screenshotUrl,
    status: 'Pending'
  });

  // Create in-app notification for the user
  await Notification.create({
    userId: req.userId,
    title: 'Payment Proof Received',
    message: 'Your payment is under review. Estimated approval within 24 hours.',
    type: 'Premium Purchased'
  });

  console.log('💰 Payment proof submitted for review by user:', user.email);
  res.status(201).json(payment);
});

exports.getUserPaymentStatus = asyncHandler(async (req, res) => {
  const PremiumPurchase = require('../models/PremiumPurchase');
  const [legacyPayment, latestPurchase] = await Promise.all([
    PremiumPayment.findOne({ userId: req.userId }).sort({ submittedAt: -1 }),
    PremiumPurchase.findOne({ userId: req.userId }).sort({ createdAt: -1 }),
  ]);

  if (latestPurchase) {
    return res.json(latestPurchase);
  }
  res.json(legacyPayment);
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

