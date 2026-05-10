const Workout = require('../models/Workout');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

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

exports.createWorkout = asyncHandler(async (req, res) => {
  const { userId, exercise, sets, reps, weight, type, duration, date } = req.body;
  if (!exercise || !sets || !reps) {
    res.status(400);
    throw new Error('Please provide exercise, sets, and reps');
  }
  const workoutUserId = userId || req.userId;
  const workout = new Workout({ 
    userId: workoutUserId, 
    exercise, 
    sets, 
    reps, 
    weight, 
    type, 
    duration,
    ...(date && { date })
  });
  await workout.save();

  // Generate notification
  await Notification.create({
    userId: workoutUserId,
    title: 'Workout Logged',
    message: `Strong work! You've logged your ${exercise} session. Keep it up!`,
    type: 'workout'
  });

  console.log('🏋️ Workout saved to MongoDB for user:', workoutUserId);
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
  const { sets, reps, weight } = req.body;
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { sets, reps, weight } },
    { new: true }
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

    // 1. Chart Data (Last 7 days)
    const workouts = await Workout.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: 1 });
    const chartDataMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      chartDataMap[dateStr] = { volume: 0, sets: 0, date: dateStr };
    }
    workouts.forEach(w => {
      const dateStr = new Date(w.date).toISOString().split('T')[0];
      if (chartDataMap[dateStr]) {
        chartDataMap[dateStr].volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
        chartDataMap[dateStr].sets += (w.sets || 0);
      }
    });
    const chartData = Object.values(chartDataMap);

    // 2. Weekly Summary
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const thisWeekWorkouts = await Workout.find({ userId, date: { $gte: startOfWeek } });
    const lastWeekWorkouts = await Workout.find({ userId, date: { $gte: startOfLastWeek, $lt: startOfWeek } });
    const calculateStats = (wList) => {
      let workouts = new Set();
      let sets = 0;
      let volume = 0;
      wList.forEach(w => {
        workouts.add(new Date(w.date).toISOString().split('T')[0]);
        sets += w.sets || 0;
        volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      });
      return { count: workouts.size, sets, volume };
    };
    const thisWeekStats = calculateStats(thisWeekWorkouts);
    const lastWeekStats = calculateStats(lastWeekWorkouts);

    // 3. Streak
    const allWorkouts = await Workout.find({ userId }).sort({ date: -1 });
    let streak = 0;
    let checkDate = new Date(startOfToday);
    const datesWithWorkouts = new Set(allWorkouts.map(w => new Date(w.date).toISOString().split('T')[0]));
    if (datesWithWorkouts.has(checkDate.toISOString().split('T')[0])) {
      while (datesWithWorkouts.has(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      while (datesWithWorkouts.has(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // 4. All-time totals
    const allWorkoutsTotal = await Workout.find({ userId });
    const totalWorkouts = new Set(allWorkoutsTotal.map(w => new Date(w.date).toISOString().split('T')[0])).size;
    let totalSets = 0;
    let totalWeight = 0;
    allWorkoutsTotal.forEach(w => {
      totalSets += w.sets || 0;
      totalWeight += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
    });

    // 5. Insight
    const volumeDiff = thisWeekStats.volume - lastWeekStats.volume;
    const volumePct = lastWeekStats.volume > 0 ? ((volumeDiff / lastWeekStats.volume) * 100).toFixed(0) : null;
    let insight = "Keep pushing your limits 💪";
    if (streak >= 5) insight = `Incredible! ${streak}-day streak — you're on fire! 🔥`;
    else if (streak >= 3) insight = `${streak} days straight! Great consistency this week! 🏆`;
    else if (volumePct !== null && volumeDiff > 0) insight = `You lifted ${volumePct}% more than last week! Keep it up! 📈`;
    else if (thisWeekStats.count >= 4) insight = "Amazing week! 4+ sessions — elite effort! 💥";
    else if (thisWeekStats.count === 0) insight = "Time to get back in the gym. You've got this! 💪";
    else if (volumeDiff < 0) insight = "Volume is down vs last week. Push harder this week! 🎯";

    res.json({
      weeklyStats: thisWeekStats, lastWeekStats,
      comparison: { lastWeekVolume: lastWeekStats.volume, difference: volumeDiff, percentage: lastWeekStats.volume > 0 ? ((volumeDiff / lastWeekStats.volume) * 100) : 100 },
      streak, chartData,
      lastWorkoutDate: allWorkouts.length > 0 ? allWorkouts[0].date : null,
      totalWorkouts, totalSets, totalWeight: Math.round(totalWeight), insight,
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
  const totalVolume = lastWorkouts.reduce((acc, w) => acc + (w.sets * w.reps * (w.weight || 1)), 0);
  const avgVolume = totalVolume / lastWorkouts.length;
  const lastVolume = lastWorkout.sets * lastWorkout.reps * (lastWorkout.weight || 1);
  
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

