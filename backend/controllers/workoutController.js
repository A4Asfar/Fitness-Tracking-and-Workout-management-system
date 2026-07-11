const Workout = require('../models/Workout');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getLocalDateString, calculateBMI } = require('../utils/dateUtils');

exports.getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
  res.json(workouts);
});

exports.getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, userId: req.userId });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }
  res.json(workout);
});

const workoutTypeRules = {
  Strength: {
    required: ['exercise', 'sets', 'reps', 'weight'],
    optional: ['duration'],
    forbidden: ['distance', 'calories', 'speed', 'rounds', 'workTime', 'restTime', 'difficulty']
  },
  Cardio: {
    required: ['exercise', 'duration'],
    optional: ['distance', 'calories', 'speed'],
    forbidden: ['sets', 'reps', 'weight', 'rounds', 'workTime', 'restTime', 'difficulty']
  },
  HIIT: {
    required: ['exercise', 'rounds', 'workTime', 'restTime'],
    optional: ['duration'],
    forbidden: ['sets', 'reps', 'weight', 'distance', 'calories', 'speed', 'difficulty']
  },
  Yoga: {
    required: ['exercise', 'duration'],
    optional: ['difficulty'],
    forbidden: ['sets', 'reps', 'weight', 'distance', 'calories', 'speed', 'rounds', 'workTime', 'restTime']
  }
};

function validateAndSanitizeWorkout(body) {
  const type = body.type || 'Strength';
  const rules = workoutTypeRules[type];
  if (!rules) {
    throw new Error(`Unsupported workout type: ${type}`);
  }

  // 1. Check for forbidden fields to prevent impossible combinations (e.g. Cardio + Weight)
  for (const field of rules.forbidden) {
    const val = body[field];
    if (val !== undefined && val !== null && val !== '' && val !== 0 && val !== '0') {
      throw new Error(`Field '${field}' is not allowed for ${type} workouts.`);
    }
  }

  // 2. Validate required fields with friendly type-specific messages
  for (const field of rules.required) {
    const val = body[field];
    if (val === undefined || val === null || val === '') {
      if (field === 'exercise') {
        throw new Error('Exercise name is required.');
      }
      if (field === 'sets') {
        throw new Error('Sets are required for Strength workouts.');
      }
      if (field === 'reps') {
        throw new Error('Reps are required for Strength workouts.');
      }
      if (field === 'weight') {
        throw new Error('Weight is required for Strength workouts.');
      }
      if (field === 'duration') {
        throw new Error(`Duration is required for ${type} workouts.`);
      }
      if (field === 'rounds') {
        throw new Error('Rounds are required for HIIT workouts.');
      }
      if (field === 'workTime') {
        throw new Error('Work Time is required for HIIT workouts.');
      }
      if (field === 'restTime') {
        throw new Error('Rest Time is required for HIIT workouts.');
      }
      throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required for ${type} workouts.`);
    }

    // Value validations (must be greater than zero)
    if (field === 'sets' || field === 'reps' || field === 'rounds' || field === 'workTime' || field === 'restTime') {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new Error(`${field === 'workTime' ? 'Work Time' : field === 'restTime' ? 'Rest Time' : field.charAt(0).toUpperCase() + field.slice(1)} must be greater than zero.`);
      }
    }
    if (field === 'weight') {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Weight must be greater than zero for Strength workouts.');
      }
    }
    if (field === 'duration') {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new Error(`Duration must be greater than zero for ${type} workouts.`);
      }
    }
  }

  // 3. Validate optional number fields if provided
  if (body.duration !== undefined && body.duration !== null && body.duration !== '') {
    const num = parseInt(body.duration);
    if (num <= 0) throw new Error('Duration must be greater than zero.');
  }
  if (body.distance !== undefined && body.distance !== null && body.distance !== '') {
    const num = parseFloat(body.distance);
    if (num <= 0) throw new Error('Distance must be greater than zero.');
  }
  if (body.calories !== undefined && body.calories !== null && body.calories !== '') {
    const num = parseInt(body.calories);
    if (num <= 0) throw new Error('Calories must be greater than zero.');
  }
  if (body.speed !== undefined && body.speed !== null && body.speed !== '') {
    const num = parseFloat(body.speed);
    if (num <= 0) throw new Error('Speed must be greater than zero.');
  }

  // 4. Build sanitized payload with only applicable fields
  const sanitized = {
    type,
    exercise: body.exercise.trim()
  };

  const allowedFields = [...rules.required, ...rules.optional];
  allowedFields.forEach(field => {
    const val = body[field];
    if (val !== undefined && val !== null && val !== '') {
      if (field === 'difficulty') {
        sanitized[field] = val.toString().trim();
      } else if (field === 'exercise') {
        // already handled
      } else {
        sanitized[field] = val.toString().includes('.') ? parseFloat(val) : parseInt(val);
      }
    }
  });

  // Explicitly unset forbidden fields
  rules.forbidden.forEach(field => {
    sanitized[field] = undefined;
  });

  return sanitized;
}

exports.createWorkout = asyncHandler(async (req, res) => {
  let sanitized;
  try {
    sanitized = validateAndSanitizeWorkout(req.body);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }

  const workout = new Workout({
    userId: req.userId,
    ...sanitized,
    ...(req.body.date && { date: req.body.date })
  });
  await workout.save();

  // Generate notification
  await Notification.create({
    userId: req.userId,
    title: 'Workout Logged',
    message: `Strong work! You've logged your ${sanitized.exercise} session. Keep it up!`,
    type: 'workout'
  });

  console.log('🏋️ Workout saved to MongoDB for user:', req.userId);
  res.status(201).json(workout);
});

exports.deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }
  res.json({ message: 'Workout deleted successfully' });
});

exports.updateWorkout = asyncHandler(async (req, res) => {
  let sanitized;
  try {
    sanitized = validateAndSanitizeWorkout(req.body);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }

  // Construct MongoDB update with $set and $unset
  const updateQuery = { $set: {}, $unset: {} };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      updateQuery.$unset[key] = "";
    } else {
      updateQuery.$set[key] = sanitized[key];
    }
  });

  if (req.body.date) {
    updateQuery.$set.date = req.body.date;
  }

  if (Object.keys(updateQuery.$unset).length === 0) {
    delete updateQuery.$unset;
  }

  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    updateQuery,
    { returnDocument: 'after', new: true }
  );

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }
  res.json(workout);
});

exports.getWorkoutStats = asyncHandler(async (req, res) => {
  const totalWorkouts = await Workout.countDocuments({ userId: req.userId });
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const workoutsThisWeek = await Workout.countDocuments({
    userId: req.userId,
    date: { $gte: startOfWeek }
  });
  const lastWorkout = await Workout.findOne({ userId: req.userId }).sort({ date: -1 }).select('date');
  res.json({
    totalWorkouts,
    workoutsThisWeek,
    lastWorkoutDate: lastWorkout ? lastWorkout.date : null
  });
});

exports.getWorkoutAnalytics = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Aggregate steps logged today
  const StepLog = require('../models/StepLog');
  const todayStepLogs = await StepLog.find({ userId, date: { $gte: startOfToday } });
  const todaySteps = todayStepLogs.reduce((sum, log) => sum + log.steps, 0);

  // 1. Fetch workouts for the last 7 days in a single query
  const recentWorkouts = await Workout.find({
    userId,
    date: { $gte: sevenDaysAgo }
  }).sort({ date: 1 });

  // Build 7-day chart data and weekly stats in a single pass
  const chartDataMap = {};
  const weeklyStatsMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = getLocalDateString(d);
    chartDataMap[dateStr] = { volume: 0, sets: 0, date: dateStr };
    weeklyStatsMap[dateStr] = { date: dateStr, duration: 0, calories: 0 };
  }

  recentWorkouts.forEach(w => {
    const dateStr = getLocalDateString(w.date);
    if (chartDataMap[dateStr]) {
      chartDataMap[dateStr].volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      chartDataMap[dateStr].sets += (w.sets || 0);
    }
    if (weeklyStatsMap[dateStr]) {
      weeklyStatsMap[dateStr].duration += (w.duration || 30);
      weeklyStatsMap[dateStr].calories += Math.round((w.duration || 30) * 8.5);
    }
  });

  const chartData = Object.values(chartDataMap);
  const weeklyStats = Object.values(weeklyStatsMap);

  // 2. Weekly Summary Comparison — single query with date range
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const [thisWeekWorkouts, lastWeekWorkouts, allWorkouts] = await Promise.all([
    Workout.find({ userId, date: { $gte: startOfWeek } }),
    Workout.find({ userId, date: { $gte: startOfLastWeek, $lt: startOfWeek } }),
    Workout.find({ userId }).sort({ date: -1 }),
  ]);

  const calculateStats = (wList) => {
    const uniqueDays = new Set();
    let sets = 0;
    let volume = 0;
    wList.forEach(w => {
      uniqueDays.add(getLocalDateString(w.date));
      sets += w.sets || 0;
      volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
    });
    return { count: uniqueDays.size, sets, volume };
  };

  const thisWeekSummary = calculateStats(thisWeekWorkouts);
  const lastWeekStats = calculateStats(lastWeekWorkouts);

  // 3. Streak — computed from allWorkouts fetched above
  let streak = 0;
  let checkDate = new Date(startOfToday);
  const datesWithWorkouts = new Set(allWorkouts.map(w => getLocalDateString(w.date)));

  if (datesWithWorkouts.has(getLocalDateString(checkDate))) {
    while (datesWithWorkouts.has(getLocalDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    while (datesWithWorkouts.has(getLocalDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // 4. All-time totals — computed from allWorkouts fetched above
  const totalWorkouts = new Set(allWorkouts.map(w => getLocalDateString(w.date))).size;
  let totalSets = 0;
  let totalWeight = 0;
  let totalCaloriesBurned = 0;
  allWorkouts.forEach(w => {
    totalSets += w.sets || 0;
    totalWeight += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
    totalCaloriesBurned += Math.round((w.duration || 30) * 8.5);
  });

  // 5. BMI Calculation
  const User = require('../models/User');
  const user = await User.findById(userId);
  const { bmi, bmiCategory } = calculateBMI(user?.weight, user?.height);

  // 6. Calories Summary (Meals / Intake today)
  const MealSelection = require('../models/MealSelection');
  const todayMeals = await MealSelection.find({
    userId,
    selectedAt: { $gte: startOfToday }
  });

  const caloriesIntake = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const todayCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const todayFats = todayMeals.reduce((sum, m) => sum + (m.fats || 0), 0);

  let calorieTarget = 2000;
  if (user?.fitnessGoal) {
    if (user.fitnessGoal.includes('Loss')) calorieTarget = 1700;
    else if (user.fitnessGoal.includes('Gain')) calorieTarget = 2700;
    else if (user.fitnessGoal.includes('Endurance')) calorieTarget = 2400;
  }

  const todayWorkoutsFiltered = recentWorkouts.filter(w => new Date(w.date) >= startOfToday);
  const caloriesBurnedToday = todayWorkoutsFiltered.reduce(
    (sum, w) => sum + Math.round((w.duration || 30) * 8.5), 0
  );

  // 7. Insight
  const volumeDiff = thisWeekSummary.volume - lastWeekStats.volume;
  const volumePct = lastWeekStats.volume > 0 ? ((volumeDiff / lastWeekStats.volume) * 100).toFixed(0) : null;
  let insight = 'Keep pushing your limits 💪';
  if (streak >= 5) insight = `Incredible! ${streak}-day streak — you're on fire! 🔥`;
  else if (streak >= 3) insight = `${streak} days straight! Great consistency this week! 🏆`;
  else if (volumePct !== null && volumeDiff > 0) insight = `You lifted ${volumePct}% more than last week! Keep it up! 📈`;
  else if (thisWeekSummary.count >= 4) insight = 'Amazing week! 4+ sessions — elite effort! 💥';
  else if (thisWeekSummary.count === 0) insight = "Time to get back in the gym. You've got this! 💪";
  else if (volumeDiff < 0) insight = 'Volume is down vs last week. Push harder this week! 🎯';

  res.json({
    weeklyStats,
    thisWeekSummary,
    lastWeekStats,
    comparison: {
      lastWeekVolume: lastWeekStats.volume,
      difference: volumeDiff,
      percentage: lastWeekStats.volume > 0 ? ((volumeDiff / lastWeekStats.volume) * 100) : 100
    },
    streak,
    chartData,
    lastWorkoutDate: allWorkouts.length > 0 ? allWorkouts[0].date : null,
    totalWorkouts,
    totalSets,
    totalWeight: Math.round(totalWeight),
    insight,
    todaySteps,
    bmi,
    bmiCategory,
    totalCalories: totalCaloriesBurned,
    caloriesSummary: {
      target: calorieTarget,
      consumed: caloriesIntake,
      burned: caloriesBurnedToday,
      net: caloriesIntake - caloriesBurnedToday,
      protein: todayProtein,
      carbs: todayCarbs,
      fats: todayFats
    }
  });
});

exports.getHomeInsights = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const lastWorkouts = await Workout.find({ userId }).sort({ date: -1 }).limit(3);

  if (lastWorkouts.length === 0) {
    return res.json({
      recoveryScore: 'N/A',
      intensityLevel: 'Low',
      advice: 'Log your first workout to see recovery insights and tailored advice.',
      recoveryStatus: 'Ready'
    });
  }

  const lastWorkout = lastWorkouts[0];
  const hoursSinceLast = (new Date() - new Date(lastWorkout.date)) / 3600000;

  let recoveryScore = 85;
  let status = 'Optimal';
  let advice = 'Your energy levels should be peaked. Today is a great day for a heavy session!';
  let recoveryStatus = 'Fully Recovered';

  if (hoursSinceLast < 24) {
    recoveryScore = 45;
    status = 'Recovering';
    advice = 'Your muscles are still repairing. Focus on light mobility or active recovery today.';
    recoveryStatus = 'In Progress';
  } else if (hoursSinceLast < 48) {
    recoveryScore = 70;
    status = 'Moderate';
    advice = 'Most tissues are recovered. A moderate intensity workout is recommended.';
    recoveryStatus = 'Near Complete';
  }

  // Calculate intensity based on volume vs average
  const totalVolume = lastWorkouts.reduce((acc, w) => acc + ((w.sets || 0) * (w.reps || 0) * (w.weight || 1)), 0);
  const avgVolume = totalVolume / lastWorkouts.length;
  const lastVolume = (lastWorkout.sets || 0) * (lastWorkout.reps || 0) * (lastWorkout.weight || 1);

  let intensityLevel = 'Balanced';
  if (lastVolume > avgVolume * 1.2) {
    intensityLevel = 'High Intensity';
    if (hoursSinceLast < 48) advice = 'Last session was very intense. Ensure you prioritize sleep and protein intake.';
  } else if (lastVolume < avgVolume * 0.8) {
    intensityLevel = 'Light Activity';
  }

  res.json({
    recoveryScore: `${recoveryScore}%`,
    intensityLevel,
    advice,
    recoveryStatus: status,
    lastVolume
  });
});

