const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create a new Diet Plan (Admin/Trainer)
// @route   POST /api/diet-plans
exports.createDietPlan = asyncHandler(async (req, res) => {
  const { title, goal, durationWeeks, dailyCalories, protein, carbs, fat, waterTarget, notes, days, status, assignedUserId } = req.body;

  if (!title || !goal || !dailyCalories) {
    res.status(400);
    throw new Error('Please provide all required fields (title, goal, dailyCalories)');
  }

  const dietPlan = new DietPlan({
    title,
    goal,
    durationWeeks,
    dailyCalories,
    protein: protein || 150,
    carbs: carbs || 200,
    fat: fat || 70,
    waterTarget,
    notes,
    days: days || [],
    trainerId: req.userId,
    status: status || 'Active',
    assignedUserId
  });

  await dietPlan.save();
  res.status(201).json(dietPlan);
});

// @desc    Get all Diet Plans (Admin/Trainer)
// @route   GET /api/diet-plans
exports.getAllDietPlans = asyncHandler(async (req, res) => {
  const plans = await DietPlan.find({}).sort({ createdAt: -1 }).lean();
  res.json(plans);
});

// Helper function to auto-generate a diet plan template
const generatePlanForGoal = (goal, userId) => {
  let title = 'General Health Plan';
  let dailyCalories = 2200;
  let protein = 130;
  let carbs = 250;
  let fat = 75;
  let dbGoal = 'Maintain';
  
  // Base meals
  const defaultMeals = {
    breakfast: { mealName: 'Oatmeal & Eggs', foods: [{ name: 'Oats', serving: 'cup', quantity: 1 }, { name: 'Eggs', serving: 'large', quantity: 3 }], calories: 450, protein: 30, carbs: 50, fat: 15 },
    lunch: { mealName: 'Chicken Rice Bowl', foods: [{ name: 'Chicken Breast', serving: 'oz', quantity: 6 }, { name: 'Brown Rice', serving: 'cup', quantity: 1 }], calories: 600, protein: 50, carbs: 45, fat: 10 },
    dinner: { mealName: 'Salmon & Asparagus', foods: [{ name: 'Salmon', serving: 'oz', quantity: 6 }, { name: 'Asparagus', serving: 'spears', quantity: 10 }], calories: 500, protein: 40, carbs: 10, fat: 25 },
    snack1: { mealName: 'Protein Shake', foods: [{ name: 'Whey Protein', serving: 'scoop', quantity: 1 }], calories: 120, protein: 25, carbs: 3, fat: 2 }
  };

  if (goal === 'Weight Loss') {
    title = 'AI Fat Loss Protocol';
    dbGoal = 'Weight Loss';
    dailyCalories = 1800;
    protein = 150;
    carbs = 150;
    fat = 60;
    defaultMeals.lunch = { mealName: 'Grilled Chicken Salad', foods: [{ name: 'Chicken', serving: 'oz', quantity: 6 }, { name: 'Greens', serving: 'cups', quantity: 3 }], calories: 400, protein: 50, carbs: 10, fat: 15 };
    defaultMeals.dinner = { mealName: 'White Fish & Broccoli', foods: [{ name: 'Tilapia', serving: 'oz', quantity: 6 }, { name: 'Broccoli', serving: 'cup', quantity: 1 }], calories: 350, protein: 45, carbs: 15, fat: 5 };
  } else if (goal === 'Muscle Gain') {
    title = 'AI Mass Builder Protocol';
    dbGoal = 'Muscle Gain';
    dailyCalories = 3000;
    protein = 180;
    carbs = 350;
    fat = 90;
    defaultMeals.lunch = { mealName: 'Double Chicken Rice Bowl', foods: [{ name: 'Chicken', serving: 'oz', quantity: 8 }, { name: 'Rice', serving: 'cups', quantity: 2 }], calories: 800, protein: 65, carbs: 90, fat: 15 };
    defaultMeals.dinner = { mealName: 'Steak & Sweet Potato', foods: [{ name: 'Steak', serving: 'oz', quantity: 8 }, { name: 'Sweet Potato', serving: 'large', quantity: 1 }], calories: 750, protein: 60, carbs: 50, fat: 30 };
    defaultMeals.snack2 = { mealName: 'Peanut Butter Toast', foods: [{ name: 'Bread', serving: 'slices', quantity: 2 }, { name: 'Peanut Butter', serving: 'tbsp', quantity: 2 }], calories: 350, protein: 12, carbs: 30, fat: 16 };
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => ({
    dayOfWeek: d,
    ...defaultMeals
  }));

  return new DietPlan({
    title,
    goal: dbGoal,
    durationWeeks: 12,
    dailyCalories,
    protein,
    carbs,
    fat,
    waterTarget: 3.0,
    notes: `Auto-generated plan optimized for ${goal}`,
    days,
    trainerId: userId,
    status: 'Active',
    assignedUserId: userId
  });
};

// @desc    Get assigned Diet Plan for current user
// @route   GET /api/diet-plans/my-plan
exports.getMyDietPlan = asyncHandler(async (req, res) => {
  const plan = await DietPlan.findOne({ assignedUserId: req.userId, status: 'Active' }).sort({ createdAt: -1 }).lean();
  
  if (!plan) {
    const user = await User.findById(req.userId);
    if (user && user.fitnessGoal && user.fitnessGoal !== 'None') {
       const newPlan = generatePlanForGoal(user.fitnessGoal, req.userId);
       await newPlan.save();
       return res.status(201).json(newPlan);
    }
    return res.status(200).json(null); // No plan assigned
  }
  res.json(plan);
});

// @desc    Update a Diet Plan
// @route   PUT /api/diet-plans/:id
exports.updateDietPlan = asyncHandler(async (req, res) => {
  const plan = await DietPlan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error('Diet Plan not found');
  }

  const updatedPlan = await DietPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedPlan);
});

// @desc    Delete a Diet Plan
// @route   DELETE /api/diet-plans/:id
exports.deleteDietPlan = asyncHandler(async (req, res) => {
  const plan = await DietPlan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error('Diet Plan not found');
  }

  await plan.deleteOne();
  res.json({ message: 'Diet Plan removed successfully' });
});

// @desc    Assign Diet Plan to User
// @route   POST /api/diet-plans/:id/assign
exports.assignDietPlan = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const plan = await DietPlan.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('Diet Plan not found');
  }
  
  plan.assignedUserId = userId;
  await plan.save();

  res.json({ message: 'Plan assigned successfully', plan });
});
