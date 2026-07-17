export interface IntelligenceParams {
  user: any;
  analytics: any;
  meals: any[];
  dietPlan?: any;
}

export interface IntelligenceResult {
  fitnessScore: number;
  scoreLabel: string;
  aiStatus: string;
  
  workoutScore: number;
  nutritionScore: number;
  dietAdherence: number;
  recoveryScore: number;
  goalAchievementScore: number;
  bodyProgressScore: number;

  healthGrade: string;
  netCalories: number;
  netCaloriesLabel: string;
  netCaloriesColor: string;
  
  goalInsight: string;
  aiCoachMessages: string[];
  
  goalAchievement: {
    currentGoal: string;
    progressPct: number;
    remaining: string;
    estimatedCompletion: string;
    strengthTrend: string;
    nutritionTrend: string;
  };
  
  consistency: {
    workoutConsistency: number;
    mealConsistency: number;
    recoveryConsistency: number;
    overallDiscipline: number;
    streak: number;
  };

  weeklyReport: {
    achievements: string[];
    warnings: string[];
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  };

  monthlySummary: {
    thisMonthScore: number;
    lastMonthScore: number;
    improvement: number;
    summaryText: string;
  };

  weeklyTrends: {
    caloriesBurned: number[];
    caloriesConsumed: number[];
    workoutVolume: number[];
    labels: string[];
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
    waterPlanned: number;
    waterConsumed: number;
    fiberPlanned: number;
    fiberConsumed: number;
    dailyCompliancePct: number;
    weeklyCompliancePct: number;
    monthlyCompliancePct: number;
    adherenceLabel: string;
    mealStatuses: Record<string, 'Completed' | 'Partially Followed' | 'Skipped' | 'Extra'>;
  };
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calculateDailyCompliance(plannedDay: any, loggedMealsForDay: any[]) {
  if (!plannedDay) return { compliance: 0, statuses: {} };

  let totalWeight = 0;
  let earnedWeight = 0;
  const statuses: Record<string, 'Completed' | 'Partially Followed' | 'Skipped' | 'Extra'> = {};

  const loggedTypes = loggedMealsForDay.map((m: any) => m.mealType || m.category || 'Unknown');
  const loggedSet = new Set(loggedTypes);

  ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'].forEach(mealKey => {
     const pMeal = plannedDay[mealKey];
     if (pMeal && pMeal.foods && pMeal.foods.length > 0) {
        totalWeight += 1;
        const checkKey = mealKey.includes('snack') ? 'Snack' : mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
        const matchingLog = loggedMealsForDay.find(m => (m.mealType || m.category) === checkKey);
        
        if (!matchingLog) {
           statuses[mealKey] = 'Skipped';
        } else {
           const calsDiff = Math.abs((matchingLog.calories || 0) - (pMeal.calories || 0));
           const isClose = calsDiff <= (pMeal.calories * 0.20) || calsDiff < 50;
           if (isClose) { statuses[mealKey] = 'Completed'; earnedWeight += 1; } 
           else { statuses[mealKey] = 'Partially Followed'; earnedWeight += 0.5; }
           loggedSet.delete(checkKey);
        }
     }
  });

  loggedSet.forEach(extra => {
     statuses[`extra_${extra}`] = 'Extra';
     totalWeight += 0.2; 
  });

  const compliance = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { compliance: Math.min(100, Math.max(0, compliance)), statuses };
}

export function generateIntelligence({ user, analytics, meals, dietPlan }: IntelligenceParams): IntelligenceResult {
  const goal = dietPlan?.goal || user?.fitnessGoal || 'Maintain Fitness';
  const targetCalories = dietPlan?.dailyCalories || (user as any)?.dailyCalorieTarget || (goal.includes('Loss') ? 1800 : goal.includes('Gain') ? 2800 : 2200);
  const targetProtein = dietPlan?.protein || (user?.weight ? user.weight * 2 : 150);
  const targetWeight = user?.targetWeight || (goal.includes('Loss') ? (user?.weight || 80) - 5 : (user?.weight || 70) + 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const last30Meals = meals.filter((m: any) => new Date(m.selectedAt || m.createdAt || m.date) >= thirtyDaysAgo);
  
  let todayConsumed = 0;
  let todayProtein = 0;
  let todayCarbs = 0;
  let todayFat = 0;
  let todayFiber = 0;
  let todayWater = 0;

  const todayMeals = last30Meals.filter((m: any) => {
    const md = new Date(m.selectedAt || m.createdAt || m.date);
    md.setHours(0,0,0,0);
    return md.getTime() === today.getTime();
  });

  todayMeals.forEach(m => {
    todayConsumed += m.calories || 0;
    todayProtein += m.protein || 0;
    todayCarbs += m.carbs || 0;
    todayFat += m.fats || 0;
    todayFiber += m.fiber || 0;
  });

  let dietPlanComparison;
  let dietAdherence = 0;
  let weeklyCompliancePct = 0;
  let monthlyCompliancePct = 0;
  let aiCoachMessages: string[] = [];

  // --- Adherence Calculation ---
  if (dietPlan) {
     const complianceHistory: { date: string, pct: number, statuses: any }[] = [];
     for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const dayName = DAYS_OF_WEEK[d.getDay()];
        
        const dayMeals = last30Meals.filter(m => {
           const md = new Date(m.selectedAt || m.createdAt || m.date);
           md.setHours(0,0,0,0);
           return md.getTime() === d.getTime();
        });

        const plannedDay = dietPlan.days.find((pd: any) => pd.dayOfWeek === dayName);
        if (plannedDay) {
           const { compliance, statuses } = calculateDailyCompliance(plannedDay, dayMeals);
           complianceHistory.push({ date: d.toISOString(), pct: compliance, statuses });
        }
     }

     const todayData = complianceHistory[complianceHistory.length - 1] || { pct: 0, statuses: {} };
     const last7 = complianceHistory.slice(-7);
     
     dietAdherence = todayData.pct;
     weeklyCompliancePct = last7.length ? Math.round(last7.reduce((a, b) => a + b.pct, 0) / last7.length) : 0;
     monthlyCompliancePct = complianceHistory.length ? Math.round(complianceHistory.reduce((a, b) => a + b.pct, 0) / complianceHistory.length) : 0;

     let adherenceLabel = 'Excellent';
     if (weeklyCompliancePct < 50) adherenceLabel = 'Poor';
     else if (weeklyCompliancePct < 75) adherenceLabel = 'Needs Improvement';
     else if (weeklyCompliancePct < 90) adherenceLabel = 'Good';

     dietPlanComparison = {
       caloriesPlanned: dietPlan.dailyCalories,
       caloriesConsumed: todayConsumed,
       proteinPlanned: dietPlan.protein,
       proteinConsumed: todayProtein,
       carbsPlanned: dietPlan.carbs,
       carbsConsumed: todayCarbs,
       fatPlanned: dietPlan.fat,
       fatConsumed: todayFat,
       waterPlanned: dietPlan.waterTarget || 2.5,
       waterConsumed: todayWater || 0,
       fiberPlanned: 25,
       fiberConsumed: todayFiber,
       dailyCompliancePct: dietAdherence,
       weeklyCompliancePct,
       monthlyCompliancePct,
       adherenceLabel,
       mealStatuses: todayData.statuses
     };
  }

  // --- 1. Workout Score (Max 100) ---
  let workoutScore = 0;
  const streak = analytics?.streak || 0;
  const countThisWeek = analytics?.thisWeekSummary?.count || 0;
  workoutScore += Math.min(streak * 10, 40); 
  workoutScore += Math.min(countThisWeek * 20, 60); 
  workoutScore = Math.max(0, Math.min(100, workoutScore));

  // --- 2. Nutrition Score (Max 100) ---
  let nutritionScore = 100;
  let maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
  if (user?.gender === 'female') maintenance = user?.weight ? user.weight * 22 * 1.2 : 2000;
  
  let cBurnedToday = 0;
  if (analytics?.recentWorkouts) {
    const rw = analytics.recentWorkouts.find((w:any) => new Date(w.date).getTime() >= today.getTime());
    if (rw) cBurnedToday = rw.caloriesBurned || 0;
  }
  
  const netCalories = todayConsumed - cBurnedToday;
  let netCaloriesLabel = 'Maintenance';
  let netCaloriesColor = '#38BDF8'; 

  if (netCalories < maintenance - 500) {
    netCaloriesLabel = 'Deficit';
    netCaloriesColor = '#10B981'; 
    if (!goal.includes('Loss')) nutritionScore -= 20;
  } else if (netCalories > maintenance + 500) {
    netCaloriesLabel = 'Dangerous Surplus';
    netCaloriesColor = '#EF4444'; 
    if (goal.includes('Loss')) nutritionScore -= 40;
    else if (!goal.includes('Gain') && !goal.includes('Bulking')) nutritionScore -= 20;
  } else if (netCalories > maintenance + 200) {
    netCaloriesLabel = 'Small Surplus';
    netCaloriesColor = '#F59E0B'; 
    if (goal.includes('Loss')) nutritionScore -= 15;
  }

  if (todayProtein < targetProtein * 0.7) nutritionScore -= 20;
  nutritionScore = Math.max(0, Math.min(100, nutritionScore));
  if (!dietPlan) dietAdherence = nutritionScore;

  // --- 3. Recovery Score (Max 100) ---
  let recoveryScore = 100;
  if (countThisWeek >= 6) recoveryScore = 60; 
  if (countThisWeek === 0) recoveryScore = 80; 
  if (nutritionScore < 50) recoveryScore -= 20; 
  recoveryScore = Math.max(0, Math.min(100, recoveryScore));

  // --- 4. Goal Achievement Score (Max 100) ---
  // A rough estimate based on streak and adherence
  let goalAchievementScore = Math.round((workoutScore + nutritionScore) / 2);
  if (goal.includes('Loss') && netCaloriesLabel === 'Deficit') goalAchievementScore = Math.min(100, goalAchievementScore + 10);
  if (goal.includes('Gain') && netCaloriesLabel === 'Small Surplus') goalAchievementScore = Math.min(100, goalAchievementScore + 10);

  // --- 5. Body Progress Score (Max 100) ---
  // Mocks based on current weight vs target weight
  let bodyProgressScore = 80; 
  const weightDiff = Math.abs((user?.weight || 0) - targetWeight);
  if (weightDiff < 2) bodyProgressScore = 95;
  else if (weightDiff > 10) bodyProgressScore = 60;

  // --- FINAL FITNESS SCORE (Weighted) ---
  // Workout 30%, Nutrition 20%, Adherence 20%, Recovery 10%, Goal 10%, Body 10%
  const finalScore = Math.round(
    (workoutScore * 0.3) + 
    (nutritionScore * 0.2) + 
    (dietAdherence * 0.2) + 
    (recoveryScore * 0.1) +
    (goalAchievementScore * 0.1) +
    (bodyProgressScore * 0.1)
  );

  // --- AI Fitness Status Generation ---
  let aiStatus = 'Good Progress';
  if (finalScore >= 90) aiStatus = 'Excellent Progress';
  else if (finalScore < 50) aiStatus = 'Poor Consistency';
  else if (finalScore < 70) aiStatus = 'Needs Improvement';
  
  if (countThisWeek >= 6 && recoveryScore < 70) aiStatus = 'Overtraining Risk';
  if (netCaloriesLabel === 'Dangerous Surplus' && goal.includes('Loss')) aiStatus = 'Overeating Risk';
  if (netCaloriesLabel === 'Deficit' && netCalories < 1000) aiStatus = 'Undereating Risk';
  if (finalScore > 80 && goal.includes('Gain')) aiStatus = 'Muscle Gain On Track';
  if (finalScore > 80 && goal.includes('Loss')) aiStatus = 'Fat Loss On Track';
  if (finalScore > 80 && goal.includes('Maintain')) aiStatus = 'Maintenance Success';

  // --- Personalized Cross-Referenced Coach Insights ---
  if (workoutScore > 80 && netCaloriesLabel === 'Dangerous Surplus') {
     aiCoachMessages.push("You completed all workouts but consistently exceeded calorie targets.");
  }
  if (weeklyCompliancePct > 85 && workoutScore < 40) {
     aiCoachMessages.push("You followed the meal plan but skipped strength workouts.");
  }
  if (todayProtein >= targetProtein && recoveryScore < 70) {
     aiCoachMessages.push("Protein intake is excellent, but recovery is poor. Rest more.");
  }
  if (netCaloriesLabel === 'Deficit' && goal.includes('Loss') && bodyProgressScore < 70) {
     aiCoachMessages.push("Weight is decreasing. Make sure it isn't decreasing faster than recommended.");
  }
  if (nutritionScore > 80 && workoutScore < 60) {
     aiCoachMessages.push("Your nutrition is strong but training consistency dropped.");
  }
  if (aiCoachMessages.length === 0) aiCoachMessages.push("You are perfectly balanced right now. Keep it up!");

  // --- Weekly Health Report ---
  const weeklyReport = {
    achievements: [] as string[],
    warnings: [] as string[],
    recommendations: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[]
  };

  if (workoutScore >= 80) { weeklyReport.achievements.push("Hit 80%+ Workout Score"); weeklyReport.strengths.push("Workout Volume"); }
  if (weeklyCompliancePct >= 80) { weeklyReport.achievements.push("Strong Diet Compliance"); weeklyReport.strengths.push("Nutrition Discipline"); }
  
  if (recoveryScore < 60) { weeklyReport.warnings.push("High Overtraining Risk"); weeklyReport.weaknesses.push("Recovery Management"); weeklyReport.recommendations.push("Take a mandatory rest day."); }
  if (nutritionScore < 60) { weeklyReport.warnings.push("Nutrition targets significantly missed"); weeklyReport.weaknesses.push("Diet Consistency"); weeklyReport.recommendations.push("Prep meals in advance."); }
  if (weeklyReport.strengths.length === 0) weeklyReport.strengths.push("Showing up to the app");

  // --- Consistency Analytics ---
  const mealConsistency = dietPlan ? weeklyCompliancePct : (nutritionScore > 80 ? 90 : 60);
  const overallDiscipline = Math.round((workoutScore + mealConsistency) / 2);

  // --- Goal Progress Widget ---
  const progressPct = weightDiff === 0 ? 100 : Math.min(100, Math.max(0, 100 - (weightDiff * 5)));
  
  // --- Monthly Summary Mock ---
  const lastMonthScore = Math.max(0, finalScore - Math.floor(Math.random() * 10)); 

  return {
    fitnessScore: finalScore,
    scoreLabel: finalScore >= 90 ? 'Excellent' : finalScore >= 80 ? 'Very Good' : finalScore >= 70 ? 'Good' : finalScore >= 50 ? 'Average' : 'Poor',
    aiStatus,
    workoutScore,
    nutritionScore,
    dietAdherence,
    recoveryScore,
    goalAchievementScore,
    bodyProgressScore,
    healthGrade: finalScore >= 95 ? 'A+' : finalScore >= 85 ? 'A' : finalScore >= 75 ? 'B' : finalScore >= 60 ? 'C' : 'D',
    netCalories,
    netCaloriesLabel,
    netCaloriesColor,
    goalInsight: aiStatus,
    aiCoachMessages,
    goalAchievement: {
      currentGoal: goal,
      progressPct,
      remaining: `${weightDiff.toFixed(1)} kg`,
      estimatedCompletion: '4 Weeks',
      strengthTrend: workoutScore > 70 ? 'Upward' : 'Stable',
      nutritionTrend: nutritionScore > 70 ? 'Optimized' : 'Fluctuating'
    },
    consistency: {
      workoutConsistency: workoutScore,
      mealConsistency,
      recoveryConsistency: recoveryScore,
      overallDiscipline,
      streak
    },
    weeklyReport,
    monthlySummary: {
      thisMonthScore: finalScore,
      lastMonthScore,
      improvement: finalScore - lastMonthScore,
      summaryText: finalScore >= lastMonthScore ? "You improved this month!" : "Slight drop in consistency."
    },
    weeklyTrends: { labels: ['M','T','W','T','F','S','S'], caloriesBurned: [0,0,0,0,0,0,0], caloriesConsumed: [0,0,0,0,0,0,0], workoutVolume: [0,0,0,0,0,0,0] },
    dietPlanComparison
  };
}
