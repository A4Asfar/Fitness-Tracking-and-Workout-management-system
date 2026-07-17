export interface IntelligenceParams {
  user: any;
  analytics: any;
  meals: any[];
  dietPlan?: any;
}

export interface IntelligenceResult {
  fitnessScore: number;
  scoreLabel: string;
  workoutScore: number;
  nutritionScore: number;
  dietAdherence: number;
  recoveryScore: number;
  healthGrade: string;
  netCalories: number;
  netCaloriesLabel: string;
  netCaloriesColor: string;
  goalInsight: string;
  aiCoachMessages: string[];
  achievements: { id: string; title: string; unlocked: boolean; icon: string }[];
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

  // Planned Meals Check
  ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'].forEach(mealKey => {
     const pMeal = plannedDay[mealKey];
     if (pMeal && pMeal.foods && pMeal.foods.length > 0) {
        totalWeight += 1;
        const checkKey = mealKey.includes('snack') ? 'Snack' : mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
        
        const matchingLog = loggedMealsForDay.find(m => (m.mealType || m.category) === checkKey);
        
        if (!matchingLog) {
           statuses[mealKey] = 'Skipped';
        } else {
           // Compare macros within 15% threshold
           const calsDiff = Math.abs((matchingLog.calories || 0) - (pMeal.calories || 0));
           const isClose = calsDiff <= (pMeal.calories * 0.20) || calsDiff < 50; // 20% or small absolute diff

           if (isClose) {
              statuses[mealKey] = 'Completed';
              earnedWeight += 1;
           } else {
              statuses[mealKey] = 'Partially Followed';
              earnedWeight += 0.5;
           }
           loggedSet.delete(checkKey);
        }
     }
  });

  // Extra Meals Check
  loggedSet.forEach(extra => {
     statuses[`extra_${extra}`] = 'Extra';
     totalWeight += 0.2; // Minor penalty for off-plan eating
  });

  const compliance = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { compliance: Math.min(100, Math.max(0, compliance)), statuses };
}

export function generateIntelligence({ user, analytics, meals, dietPlan }: IntelligenceParams): IntelligenceResult {
  const goal = dietPlan?.goal || user?.fitnessGoal || 'Maintain Fitness';
  const targetCalories = dietPlan?.dailyCalories || (user as any)?.dailyCalorieTarget || (goal.includes('Loss') ? 1800 : goal.includes('Gain') ? 2800 : 2200);
  const targetProtein = dietPlan?.protein || (user?.weight ? user.weight * 2 : 150);

  // --- Date Math ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  // --- Filter Meals ---
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
    // Assume water might be logged somewhere, if not it's 0
  });

  let dietPlanComparison;
  let dietAdherence = 0;
  let aiCoachMessages: string[] = [];

  // --- Deep AI Compliance Engine ---
  if (dietPlan) {
     const complianceHistory: { date: string, pct: number, statuses: any }[] = [];
     let consecutiveSkips = 0;
     let consistentlyExceedingCarbs = 0;
     let consistentlyBelowProtein = 0;

     // Calculate last 30 days compliance
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
        if (!plannedDay) continue;

        const { compliance, statuses } = calculateDailyCompliance(plannedDay, dayMeals);
        complianceHistory.push({ date: d.toISOString(), pct: compliance, statuses });

        // Insights Logic
        if (statuses['breakfast'] === 'Skipped') consecutiveSkips++;
        else consecutiveSkips = 0;

        const dayCarbs = dayMeals.reduce((acc, m) => acc + (m.carbs || 0), 0);
        const dayProtein = dayMeals.reduce((acc, m) => acc + (m.protein || 0), 0);
        
        if (dayCarbs > dietPlan.carbs * 1.2) consistentlyExceedingCarbs++;
        if (dayProtein < dietPlan.protein * 0.8) consistentlyBelowProtein++;
     }

     const todayData = complianceHistory[complianceHistory.length - 1] || { pct: 0, statuses: {} };
     const last7 = complianceHistory.slice(-7);
     
     const dailyCompliancePct = todayData.pct;
     const weeklyCompliancePct = last7.length ? Math.round(last7.reduce((a, b) => a + b.pct, 0) / last7.length) : 0;
     const monthlyCompliancePct = complianceHistory.length ? Math.round(complianceHistory.reduce((a, b) => a + b.pct, 0) / complianceHistory.length) : 0;

     dietAdherence = dailyCompliancePct; // We use daily for the main score impact

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
       fiberPlanned: 25, // Standard baseline if not in plan
       fiberConsumed: todayFiber,
       dailyCompliancePct,
       weeklyCompliancePct,
       monthlyCompliancePct,
       adherenceLabel,
       mealStatuses: todayData.statuses
     };

     // Generate AI Messages
     if (consecutiveSkips >= 3) aiCoachMessages.push("You skipped breakfast for 3 consecutive days. This impacts metabolism.");
     if (consistentlyExceedingCarbs >= 5) aiCoachMessages.push("You consistently exceed carbohydrate intake targets.");
     if (consistentlyBelowProtein >= 5) aiCoachMessages.push("Protein intake is frequently below target. Consider protein shakes.");
     if (weeklyCompliancePct > 90) aiCoachMessages.push("Excellent consistency this week. You're perfectly on track!");
     else if (dailyCompliancePct > 90) aiCoachMessages.push(`You followed today's diet by ${dailyCompliancePct}%. Great job!`);
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
  }

  if (todayProtein < targetProtein * 0.7) nutritionScore -= 20;
  nutritionScore = Math.max(0, Math.min(100, nutritionScore));

  if (!dietPlan) dietAdherence = nutritionScore; // Fallback

  // --- 4. Recovery Score (Max 100) ---
  let recoveryScore = 100;
  if (countThisWeek >= 6) recoveryScore = 60; 
  if (countThisWeek === 0) recoveryScore = 80; 
  if (nutritionScore < 50) recoveryScore -= 20; 
  recoveryScore = Math.max(0, Math.min(100, recoveryScore));

  // --- 5. Final Fitness Score ---
  const finalScore = Math.round(
    (workoutScore * 0.35) + 
    (nutritionScore * 0.25) + 
    (dietAdherence * 0.25) + 
    (recoveryScore * 0.15)
  );

  let scoreLabel = 'Excellent';
  let healthGrade = 'A+';
  if (finalScore < 50) { scoreLabel = 'Poor'; healthGrade = 'D'; }
  else if (finalScore < 70) { scoreLabel = 'Average'; healthGrade = 'C'; }
  else if (finalScore < 85) { scoreLabel = 'Good'; healthGrade = 'B'; }
  else if (finalScore < 95) { scoreLabel = 'Very Good'; healthGrade = 'A'; }

  if (aiCoachMessages.length === 0) {
     aiCoachMessages.push("Keep pushing towards your goals.");
  }

  return {
    fitnessScore: finalScore,
    scoreLabel,
    workoutScore,
    nutritionScore,
    dietAdherence,
    recoveryScore,
    healthGrade,
    netCalories,
    netCaloriesLabel,
    netCaloriesColor,
    goalInsight: dietPlan ? `Active Plan: ${dietPlan.title}` : 'No plan assigned.',
    aiCoachMessages,
    achievements: [],
    weeklyTrends: { labels: [], caloriesBurned: [], caloriesConsumed: [], workoutVolume: [] },
    dietPlanComparison
  };
}
