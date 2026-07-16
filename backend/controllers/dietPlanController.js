const DietPlan = require('../models/DietPlan');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create a new Diet Plan (Admin/Trainer)
// @route   POST /api/diet-plans
exports.createDietPlan = asyncHandler(async (req, res) => {
  const { planName, goal, targetCalories, targetProtein, targetCarbs, targetFat, waterTargetLiters, meals, status } = req.body;

  if (!planName || !goal || !targetCalories) {
    res.status(400);
    throw new Error('Please provide all required fields (planName, goal, targetCalories)');
  }

  const dietPlan = new DietPlan({
    planName,
    goal,
    targetCalories,
    targetProtein: targetProtein || 150,
    targetCarbs: targetCarbs || 200,
    targetFat: targetFat || 70,
    waterTargetLiters,
    meals: meals || [],
    trainerId: req.userId,
    status: status || 'Active'
  });

  await dietPlan.save();
  res.status(201).json(dietPlan);
});

// @desc    Get all Diet Plans (Admin/Trainer)
// @route   GET /api/diet-plans
exports.getAllDietPlans = asyncHandler(async (req, res) => {
  // Can filter by trainerId if needed, but returning all for now
  const plans = await DietPlan.find({}).sort({ createdAt: -1 });
  res.json(plans);
});

// @desc    Get assigned Diet Plan for current user
// @route   GET /api/diet-plans/my-plan
exports.getMyDietPlan = asyncHandler(async (req, res) => {
  // Find a plan where the current user is in the assignedUsers array and status is Active
  const plan = await DietPlan.findOne({ assignedUsers: req.userId, status: 'Active' }).sort({ createdAt: -1 });
  
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
  
  if (!plan.assignedUsers.includes(userId)) {
    plan.assignedUsers.push(userId);
    await plan.save();
  }

  res.json({ message: 'Plan assigned successfully', plan });
});
