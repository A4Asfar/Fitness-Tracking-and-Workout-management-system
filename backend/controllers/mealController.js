const Meal = require('../models/Meal');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getMeals = asyncHandler(async (req, res) => {
  const meals = await Meal.find({ userId: req.userId }).sort({ date: -1 });
  res.json(meals);
});

exports.createMeal = asyncHandler(async (req, res) => {
  const { mealType, mealName } = req.body;
  if (!mealType || !mealName) {
    res.status(400);
    throw new Error('Please provide meal type and name');
  }
  const meal = new Meal({ userId: req.userId, mealType, mealName });
  await meal.save();
  res.status(201).json(meal);
});

exports.deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }
  res.json({ message: 'Meal deleted successfully' });
});
