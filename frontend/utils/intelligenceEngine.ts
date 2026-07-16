export interface IntelligenceParams {
  user: any;
  analytics: any;
  meals: any[];
  dietPlan?: any;
}

export interface IntelligenceResult {
  fitnessScore: number; // 0 - 100
  scoreLabel: string; // Excellent, Very Good, Good, Average, Poor
  healthGrade: string; // A+, A, B, C, D
  netCalories: number;
  netCaloriesLabel: string; // Deficit, Surplus, Maintenance
  netCaloriesColor: string; // Green, Blue, Orange, Red
  goalInsight: string;
  aiCoachMessages: string[];
  achievements: { id: string; title: string; unlocked: boolean; icon: string }[];
  weeklyTrends: {
    caloriesBurned: number[];
    caloriesConsumed: number[];
    workoutVolume: number[];
    labels: string[];
  };
  comparison: {
    workoutEffort: number;
    nutritionQuality: number;
    recovery: number;
  };
  dietPlanComparison?: {
    caloriesPlanned: number;
    caloriesConsumed: number;
    proteinPlanned: number;
    proteinConsumed: number;
    carbsPlanned: number;
    carbsConsumed: number;
    fatPlanned: number;
    fatConsumed: number;
    completionPct: number;
    statusLabel: string;
  };
}

export function generateIntelligence({ user, analytics, meals, dietPlan }: IntelligenceParams): IntelligenceResult {
  const goal = dietPlan?.goal || user?.fitnessGoal || 'Maintain Fitness';
  const targetCalories = dietPlan?.targetCalories || (user as any)?.dailyCalorieTarget || (goal.includes('Loss') ? 1800 : goal.includes('Gain') ? 2800 : 2200);
  const targetProtein = dietPlan?.targetProtein || (user?.weight ? user.weight * 2 : 150);

  // --- Date Math ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // --- Aggregate Weekly Meals ---
  const weeklyMeals = meals.filter((m: any) => new Date(m.selectedAt || m.createdAt || m.date) >= sevenDaysAgo);
  
  let todayConsumed = 0;
  let todayProtein = 0;
  
  const dailyMealsMap: Record<string, { cals: number, protein: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    // Local date string YYYY-MM-DD
    const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    dailyMealsMap[dateStr] = { cals: 0, protein: 0 };
  }

  weeklyMeals.forEach(m => {
    const mDate = new Date(m.selectedAt || m.createdAt || m.date);
    const dateStr = new Date(mDate.getTime() - (mDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    if (dailyMealsMap[dateStr]) {
      dailyMealsMap[dateStr].cals += (m.calories || 0);
      dailyMealsMap[dateStr].protein += (m.protein || 0);
    }
    
    // Check if today
    const mDateNoTime = new Date(mDate);
    mDateNoTime.setHours(0, 0, 0, 0);
    if (mDateNoTime.getTime() === today.getTime()) {
      todayConsumed += (m.calories || 0);
      todayProtein += (m.protein || 0);
    }
  });

  // --- Fallbacks from Analytics ---
  const todayBurned = analytics?.caloriesSummary?.burned || 0;
  
  // Actually, we should get todayConsumed from meals, or fallback to analytics
  const finalTodayConsumed = todayConsumed > 0 ? todayConsumed : (analytics?.caloriesSummary?.consumed || 0);
  const netCalories = finalTodayConsumed - todayBurned;

  // --- 1. Net Daily Calories ---
  let netCaloriesLabel = 'Maintenance';
  let netCaloriesColor = '#3B82F6'; // Blue

  const maintenance = targetCalories;
  
  if (netCalories > maintenance + 300) {
    netCaloriesLabel = 'Dangerous Surplus';
    netCaloriesColor = '#EF4444'; // Red
  } else if (netCalories > maintenance) {
    netCaloriesLabel = 'Small Surplus';
    netCaloriesColor = '#F59E0B'; // Orange
  } else if (netCalories < maintenance - 200) {
    netCaloriesLabel = 'Healthy Deficit';
    netCaloriesColor = '#10B981'; // Green
  }

  // --- 2. Goal Intelligence ---
  let goalInsight = '';
  if (goal.includes('Loss') && netCalories > maintenance) {
    goalInsight = '⚠ Your eating habits are slowing your fat loss. Try to maintain a calorie deficit.';
  } else if (goal.includes('Gain') && todayProtein < targetProtein * 0.7) {
    goalInsight = `⚠ Increase protein intake to maximize muscle growth. (Target: ${Math.round(targetProtein)}g)`;
  } else if (goal.includes('Maintain')) {
    goalInsight = 'You are doing great maintaining your current balance.';
  } else {
    goalInsight = 'You are on track with your fitness goals.';
  }

  // --- 3. Fitness Score ---
  let score = 0;
  
  // Consistency (Streak) max 30
  const streak = analytics?.streak || 0;
  score += Math.min(streak * 5, 30);
  
  // Volume/Frequency max 25
  const countThisWeek = analytics?.thisWeekSummary?.count || 0;
  score += Math.min(countThisWeek * 6, 25);
  
  // Diet Quality max 25
  if (goal.includes('Loss')) {
     if (netCalories < maintenance) score += 25;
     else if (netCalories < maintenance + 200) score += 15;
     else score += 5;
  } else if (goal.includes('Gain')) {
     if (todayProtein >= targetProtein * 0.8) score += 25;
     else if (todayProtein >= targetProtein * 0.5) score += 15;
     else score += 5;
  } else {
     if (Math.abs(netCalories - maintenance) < 300) score += 25;
     else score += 15;
  }
  
  // Goal Progress max 20
  score += 20; // Base points for participating
  if (netCaloriesLabel === 'Dangerous Surplus' && goal.includes('Loss')) score -= 15;
  if (countThisWeek === 0) score -= 10;

  score = Math.max(0, Math.min(score, 100));

  let scoreLabel = 'Poor';
  if (score >= 90) scoreLabel = 'Excellent';
  else if (score >= 80) scoreLabel = 'Very Good';
  else if (score >= 65) scoreLabel = 'Good';
  else if (score >= 50) scoreLabel = 'Average';

  // --- 4. Weekly Health Grade ---
  let healthGrade = 'D';
  if (score >= 95) healthGrade = 'A+';
  else if (score >= 85) healthGrade = 'A';
  else if (score >= 75) healthGrade = 'B';
  else if (score >= 60) healthGrade = 'C';

  // --- 5. AI Coach Insights ---
  const aiCoachMessages: string[] = [];
  if (countThisWeek >= 3 && netCalories > maintenance + 500 && goal.includes('Loss')) {
    aiCoachMessages.push("You trained consistently this week but your calorie intake is preventing fat loss.");
  } else if (countThisWeek >= 3 && Math.abs(netCalories - maintenance) < 300) {
    aiCoachMessages.push("Excellent balance between nutrition and exercise.");
  } else if (countThisWeek === 0) {
    aiCoachMessages.push("You missed workouts for several days. Time to get back to it!");
  }
  
  if (todayProtein < targetProtein * 0.6) {
    aiCoachMessages.push(`Protein intake is below target. Aim for ${Math.round(targetProtein)}g to support recovery.`);
  }

  if (aiCoachMessages.length === 0) {
    aiCoachMessages.push("You are doing well. Keep up the solid routine!");
  }

  // --- 6. Achievements ---
  const achievements = [
    { id: '1', title: '7-Day Streak', unlocked: streak >= 7, icon: 'Flame' },
    { id: '2', title: 'Perfect Protein', unlocked: todayProtein >= targetProtein * 0.9, icon: 'Dumbbell' },
    { id: '3', title: 'Calorie Goal', unlocked: (goal.includes('Loss') && netCalories < maintenance) || (!goal.includes('Loss') && Math.abs(netCalories - maintenance) < 300), icon: 'Target' },
    { id: '4', title: 'Consistent', unlocked: countThisWeek >= 4, icon: 'Activity' },
    { id: '5', title: 'Balanced Life', unlocked: score >= 85, icon: 'HeartPulse' }
  ];

  // --- 7. Trends ---
  const labels: string[] = [];
  const cBurned: number[] = [];
  const cConsumed: number[] = [];
  const wVolume: number[] = [];

  const chartData = analytics?.chartData || [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStrLocal = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    const chartDay = chartData.find((cd: any) => cd.date === dateStrLocal);
    
    labels.push(d.toLocaleDateString(undefined, { weekday: 'narrow' }));
    cBurned.push(chartDay?.calories || 0);
    wVolume.push(chartDay?.volume || 0);
    cConsumed.push(dailyMealsMap[dateStrLocal]?.cals || 0);
  }

  // --- 8. Comparison ---
  const lastWeekVol = analytics?.lastWeekStats?.volume || 1;
  const thisWeekVol = analytics?.thisWeekSummary?.volume || 0;
  const weeklyTrends = {
    labels,
    caloriesBurned: cBurned,
    caloriesConsumed: cConsumed,
    workoutVolume: wVolume
  };

  let dietPlanComparison;
  if (dietPlan) {
     let todayCarbs = 0;
     let todayFat = 0;
     const todayMeals = meals.filter((m: any) => {
       const md = new Date(m.selectedAt || m.createdAt || m.date);
       md.setHours(0,0,0,0);
       return md.getTime() === today.getTime();
     });
     todayMeals.forEach(m => {
       todayCarbs += m.carbs || 0;
       todayFat += m.fats || 0;
     });

     const plannedTypes = new Set(dietPlan.meals.map((m: any) => m.mealType));
     const loggedTypes = new Set(todayMeals.map((m: any) => m.mealType));
     let matched = 0;
     plannedTypes.forEach(pt => { if (loggedTypes.has(pt)) matched++; });
     const completionPct = plannedTypes.size > 0 ? Math.round((matched / plannedTypes.size) * 100) : 0;

     let statusLabel = 'On Track';
     if (todayConsumed > dietPlan.targetCalories + 200) statusLabel = 'Surplus';
     else if (todayConsumed < dietPlan.targetCalories - 200) statusLabel = 'Deficit';

     dietPlanComparison = {
       caloriesPlanned: dietPlan.targetCalories,
       caloriesConsumed: todayConsumed,
       proteinPlanned: dietPlan.targetProtein,
       proteinConsumed: todayProtein,
       carbsPlanned: dietPlan.targetCarbs,
       carbsConsumed: todayCarbs,
       fatPlanned: dietPlan.targetFat,
       fatConsumed: todayFat,
       completionPct,
       statusLabel
     };
  }

  return {
    fitnessScore: score,
    scoreLabel,
    healthGrade,
    netCalories,
    netCaloriesLabel,
    netCaloriesColor,
    goalInsight,
    aiCoachMessages,
    achievements,
    weeklyTrends,
    comparison: {
      workoutEffort: Math.min(Math.round(((analytics?.thisWeekSummary?.count || 0) / 3) * 100), 100),
      nutritionQuality: scoreLabel === 'Excellent' ? 95 : scoreLabel === 'Very Good' ? 85 : 70,
      recovery: 80
    },
    dietPlanComparison
  };
}
