const MealSelection = require('../models/MealSelection');
const Meal = require('../models/Meal');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getMeals = asyncHandler(async (req, res) => {
  const meals = await MealSelection.find({ userId: req.userId }).sort({ selectedAt: -1 });
  res.json(meals);
});

exports.createMeal = asyncHandler(async (req, res) => {
  const { mealType, selectedMeal, calories, protein, carbs, fats, selectedAt } = req.body;
  if (!mealType || !selectedMeal) {
    res.status(400);
    throw new Error('Please provide meal type and selected meal');
  }

  // Always use the authenticated user's ID — never allow body to override
  const meal = new MealSelection({
    userId: req.userId,
    mealType,
    selectedMeal,
    calories: calories || 0,
    protein: protein || 0,
    carbs: carbs || 0,
    fats: fats || 0,
    ...(selectedAt && { selectedAt })
  });
  await meal.save();

  // Generate notification
  await Notification.create({
    userId: req.userId,
    title: 'Meal Selected',
    message: `You've logged ${selectedMeal} for ${mealType}. Excellent choice!`,
    type: 'meal'
  });

  console.log('🍽️ Meal selection saved to MongoDB for user:', req.userId);
  res.status(201).json(meal);
});

exports.getRecommendedMeals = asyncHandler(async (req, res) => {
  const { goal } = req.query;
  let query = {};
  if (goal) {
    if (goal.includes('Loss')) query.recommendedFor = 'Weight Loss';
    else if (goal.includes('Gain')) query.recommendedFor = 'Muscle Gain';
    else if (goal.includes('Maintain')) query.recommendedFor = 'Maintain Fitness';
    else if (goal.includes('Endurance')) query.recommendedFor = 'Endurance';
  }

  const meals = await Meal.find(query);
  res.json(meals);
});

exports.getMealByName = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Please provide a meal name');
  }
  // Escape special regex characters to prevent regex injection
  const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const meal = await Meal.findOne({ mealName: new RegExp(`^${escapedName}$`, 'i') });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }
  res.json(meal);
});

exports.deleteMeal = asyncHandler(async (req, res) => {
  const meal = await MealSelection.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }
  res.json({ message: 'Meal deleted successfully' });
});
