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
  
  // Maintain variations
  const breakfasts = [
    { mealName: 'Oatmeal & Eggs', foods: [{ name: 'Oats', serving: 'cup', quantity: 1 }, { name: 'Eggs', serving: 'large', quantity: 3 }], calories: 450, protein: 30, carbs: 50, fat: 15 },
    { mealName: 'Greek Yogurt & Berries', foods: [{ name: 'Greek Yogurt', serving: 'cup', quantity: 1 }, { name: 'Berries', serving: 'cup', quantity: 1 }, { name: 'Honey', serving: 'tbsp', quantity: 1 }], calories: 350, protein: 25, carbs: 40, fat: 5 },
    { mealName: 'Protein Pancakes', foods: [{ name: 'Protein Mix', serving: 'scoop', quantity: 2 }, { name: 'Milk', serving: 'cup', quantity: 0.5 }], calories: 400, protein: 35, carbs: 45, fat: 10 }
  ];
  
  const lunches = [
    { mealName: 'Chicken Rice Bowl', foods: [{ name: 'Chicken Breast', serving: 'oz', quantity: 6 }, { name: 'Brown Rice', serving: 'cup', quantity: 1 }], calories: 600, protein: 50, carbs: 45, fat: 10 },
    { mealName: 'Turkey Wrap', foods: [{ name: 'Turkey Breast', serving: 'oz', quantity: 5 }, { name: 'Tortilla', serving: 'large', quantity: 1 }], calories: 550, protein: 40, carbs: 50, fat: 15 },
    { mealName: 'Tuna Salad Sandwich', foods: [{ name: 'Tuna', serving: 'can', quantity: 1 }, { name: 'Whole Wheat Bread', serving: 'slices', quantity: 2 }], calories: 500, protein: 45, carbs: 40, fat: 12 }
  ];
  
  const dinners = [
    { mealName: 'Salmon & Asparagus', foods: [{ name: 'Salmon', serving: 'oz', quantity: 6 }, { name: 'Asparagus', serving: 'spears', quantity: 10 }], calories: 500, protein: 40, carbs: 10, fat: 25 },
    { mealName: 'Lean Beef Stir Fry', foods: [{ name: 'Lean Beef', serving: 'oz', quantity: 6 }, { name: 'Mixed Veggies', serving: 'cup', quantity: 2 }], calories: 550, protein: 45, carbs: 20, fat: 20 },
    { mealName: 'Baked Cod & Quinoa', foods: [{ name: 'Cod', serving: 'oz', quantity: 6 }, { name: 'Quinoa', serving: 'cup', quantity: 1 }], calories: 450, protein: 40, carbs: 40, fat: 10 }
  ];
  
  const snacks = [
    { mealName: 'Protein Shake', foods: [{ name: 'Whey Protein', serving: 'scoop', quantity: 1 }], calories: 120, protein: 25, carbs: 3, fat: 2 },
    { mealName: 'Almonds & Apple', foods: [{ name: 'Almonds', serving: 'oz', quantity: 1 }, { name: 'Apple', serving: 'medium', quantity: 1 }], calories: 250, protein: 6, carbs: 25, fat: 14 },
    { mealName: 'Cottage Cheese', foods: [{ name: 'Cottage Cheese', serving: 'cup', quantity: 1 }], calories: 200, protein: 25, carbs: 10, fat: 5 }
  ];

  if (goal === 'Weight Loss') {
    title = 'AI Fat Loss Protocol';
    dbGoal = 'Weight Loss';
    dailyCalories = 1800;
    protein = 150;
    carbs = 150;
    fat = 60;
    
    breakfasts[0] = { mealName: 'Egg White Omelette', foods: [{ name: 'Egg Whites', serving: 'cup', quantity: 1 }, { name: 'Spinach', serving: 'cup', quantity: 1 }], calories: 250, protein: 30, carbs: 5, fat: 5 };
    lunches[0] = { mealName: 'Grilled Chicken Salad', foods: [{ name: 'Chicken', serving: 'oz', quantity: 6 }, { name: 'Greens', serving: 'cups', quantity: 3 }], calories: 400, protein: 50, carbs: 10, fat: 15 };
    dinners[0] = { mealName: 'White Fish & Broccoli', foods: [{ name: 'Tilapia', serving: 'oz', quantity: 6 }, { name: 'Broccoli', serving: 'cup', quantity: 1 }], calories: 350, protein: 45, carbs: 15, fat: 5 };
    snacks[0] = { mealName: 'Cucumber & Hummus', foods: [{ name: 'Cucumber', serving: 'cup', quantity: 1 }, { name: 'Hummus', serving: 'tbsp', quantity: 2 }], calories: 100, protein: 3, carbs: 10, fat: 5 };
  } else if (goal === 'Muscle Gain') {
    title = 'AI Mass Builder Protocol';
    dbGoal = 'Muscle Gain';
    dailyCalories = 3000;
    protein = 180;
    carbs = 350;
    fat = 90;
    
    lunches[0] = { mealName: 'Double Chicken Rice Bowl', foods: [{ name: 'Chicken', serving: 'oz', quantity: 8 }, { name: 'Rice', serving: 'cups', quantity: 2 }], calories: 800, protein: 65, carbs: 90, fat: 15 };
    dinners[0] = { mealName: 'Steak & Sweet Potato', foods: [{ name: 'Steak', serving: 'oz', quantity: 8 }, { name: 'Sweet Potato', serving: 'large', quantity: 1 }], calories: 750, protein: 60, carbs: 50, fat: 30 };
    snacks[0] = { mealName: 'Peanut Butter Toast', foods: [{ name: 'Bread', serving: 'slices', quantity: 2 }, { name: 'Peanut Butter', serving: 'tbsp', quantity: 2 }], calories: 350, protein: 12, carbs: 30, fat: 16 };
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, index) => ({
    dayOfWeek: d,
    breakfast: breakfasts[index % breakfasts.length],
    lunch: lunches[index % lunches.length],
    dinner: dinners[index % dinners.length],
    snack1: snacks[index % snacks.length],
    ...(goal === 'Muscle Gain' ? { snack2: snacks[(index + 1) % snacks.length] } : {})
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
    notes: `Auto-generated diverse plan optimized for ${goal}`,
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
  } else if (plan.notes && plan.notes.includes('Auto-generated') && !plan.notes.includes('diverse')) {
    // Force regenerate the old static plan with the new diverse plan
    await DietPlan.findByIdAndDelete(plan._id);
    const newPlan = generatePlanForGoal(plan.goal || 'Maintain', req.userId);
    await newPlan.save();
    return res.status(201).json(newPlan);
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
