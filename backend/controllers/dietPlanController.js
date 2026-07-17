const DietPlan = require('../models/DietPlan');
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
  const plans = await DietPlan.find({}).sort({ createdAt: -1 });
  res.json(plans);
});

// @desc    Get assigned Diet Plan for current user
// @route   GET /api/diet-plans/my-plan
exports.getMyDietPlan = asyncHandler(async (req, res) => {
  const plan = await DietPlan.findOne({ assignedUserId: req.userId, status: 'Active' }).sort({ createdAt: -1 });
  
  if (!plan) {
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
