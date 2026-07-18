import { getStartOfDay, filterByDate, getCached, sumMacros, calculateMaintenance, calculateTargetProtein, sumWorkoutVolume } from './EngineUtils';
import { EngineValidator } from './EngineValidator';
import EngineDiagnostics from './EngineDiagnostics';

export interface BehaviorAnalysis {
  nutrition: {
    dailyCalories: number;
    weeklyAverageCalories: number;
    monthlyAverageCalories: number;
    maintenanceCalories: number;
    calorieTrend: string;
    proteinTarget: number;
    proteinAverage: number;
    proteinCompliance: boolean;
    recentMealsEaten: Set<string>;
  };
  workout: {
    weeklyWorkoutCount: number;
    monthlyWorkoutCount: number;
    totalTrainingVolume: number;
    acuteLoad: number;
    chronicLoad: number;
    ACWR: number;
    recoveryIndex: number;
    hasYoga: boolean;
    strengthCount: number;
    cardioCount: number;
  };
  consistency: {
    workoutConsistency: number;
    mealConsistency: number;
    loggingConsistency: number;
    streak: number;
    missedDays: number;
  };
  body: {
    plateauDetected: boolean;
    plateauDuration: number;
    weightDelta7Days: number;
  };
  behavior: {
    archetype: string;
    habits: string[];
  };
}

export default class BehaviorAnalysisEngine {
  public static generate(user: any, analytics: any, rawMeals: any[], rawWeightLogs: any[], rawWorkouts: any[]): BehaviorAnalysis {
    return getCached(rawMeals, 'BehaviorAnalysis', () => {
      try {
        const startTime = Date.now();
        const today = getStartOfDay();

      const safeUser = EngineValidator.sanitizeUser(user);
      const meals = EngineValidator.sanitizeMeals(rawMeals);
      const weightLogs = EngineValidator.sanitizeWeightLogs(rawWeightLogs);
      const workouts = EngineValidator.sanitizeWorkouts(rawWorkouts);

      // --- NUTRITION ---
      const maintenance = calculateMaintenance(safeUser);
      const targetPro = calculateTargetProtein(safeUser);
      
      const todayMeals = filterByDate(meals, 0);
      const recent7Meals = filterByDate(meals, 7);
      const recent14Meals = filterByDate(meals, 14);
      const recent30Meals = filterByDate(meals, 30);
      const past3DaysMeals = filterByDate(meals, 3);
      
      const todayMacros = sumMacros(todayMeals);
      const weeklyMacros = sumMacros(recent7Meals);
      const monthlyMacros = sumMacros(recent30Meals);
      
      const daysTracked7 = new Set(recent7Meals.map((m: any) => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size || 1;
      const daysTracked14 = new Set(recent14Meals.map((m: any) => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size || 1;
      const daysTracked30 = new Set(recent30Meals.map((m: any) => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size || 1;

      const weeklyAvgCals = weeklyMacros.calories / daysTracked7;
      const monthlyAvgCals = monthlyMacros.calories / daysTracked30;
      const weeklyAvgPro = weeklyMacros.protein / daysTracked7;
      
      let calorieTrend = 'Maintenance';
      if (monthlyAvgCals < maintenance - 300) calorieTrend = 'Deficit';
      else if (monthlyAvgCals > maintenance + 300) calorieTrend = 'Surplus';

      const recentMealsEaten = new Set(past3DaysMeals.map((m: any) => m.name));

      // --- WORKOUT ---
      const recent7Workouts = filterByDate(workouts, 7);
      const recent28Workouts = filterByDate(workouts, 28);
      
      const acuteVol = sumWorkoutVolume(recent7Workouts).volume;
      const chronicVol = sumWorkoutVolume(recent28Workouts).volume / 4;
      
      let acwr = 1.0;
      if (chronicVol > 0) acwr = acuteVol / chronicVol;
      else if (acuteVol > 0) acwr = 1.5;

      let strengthCount = 0;
      let cardioCount = 0;
      let hasYoga = false;
      recent7Workouts.forEach(w => {
        if (w.type === 'Strength') strengthCount++;
        if (w.type === 'Cardio' || w.type === 'HIIT') cardioCount++;
        if (w.type === 'Yoga' || w.name?.includes('Yoga')) hasYoga = true;
      });

      const restDays = 7 - recent7Workouts.length;
      let recoveryIndex = 100;
      if (acwr >= 1.5) recoveryIndex -= 40;
      else if (acwr >= 1.3) recoveryIndex -= 20;
      if (restDays === 0) recoveryIndex -= 25;
      if (weeklyAvgCals > 0 && weeklyAvgCals < 1500) recoveryIndex -= 25;
      recoveryIndex = Math.max(0, recoveryIndex);

      // --- CONSISTENCY ---
      const streak = analytics?.streak || 0;
      const workoutConsistency = Math.min(100, Math.round((recent28Workouts.length / 16) * 100));
      const mealConsistency = Math.min(100, Math.round((daysTracked30 / 30) * 100));
      const loggingConsistency = Math.round((workoutConsistency + mealConsistency) / 2);

      // --- BODY ---
      let plateauDuration = 0;
      let weightDelta7Days = 0;
      const recentWeights = filterByDate(weightLogs, 30);
      if (recentWeights.length >= 3) {
         const latest = recentWeights[recentWeights.length - 1].weight;
         for (let i = recentWeights.length - 2; i >= 0; i--) {
            if (Math.abs(recentWeights[i].weight - latest) <= 0.5) {
               plateauDuration = Math.max(1, (new Date(latest.date).getTime() - new Date(recentWeights[i].date).getTime()) / (1000*3600*24));
            } else break;
         }
      }
      
      if (recentWeights.length >= 2) {
         const recent7 = recentWeights.slice(-7);
         if (recent7.length >= 2) {
            const oldest = recent7[0];
            const newest = recent7[recent7.length - 1];
            const days = Math.max(1, (new Date(newest.date).getTime() - new Date(oldest.date).getTime()) / (1000*3600*24));
            const dailyDelta = (newest.weight - oldest.weight) / days;
            weightDelta7Days = dailyDelta * 7;
         }
      }

      // --- BEHAVIOR ---
      const habits = [];
      let breakfastCount = 0;
      let lateNightCals = 0;
      let weekendCals = 0;
      let weekdayCals = 0;
      let weekendCount = 0;
      let weekdayCount = 0;

      meals.forEach(m => {
         const md = new Date(m.selectedAt || m.createdAt || m.date);
         const hour = md.getHours();
         const day = md.getDay();
         if ((m.mealType || m.category) === 'Breakfast' || hour < 10) breakfastCount++;
         if (hour >= 21) lateNightCals += (m.calories || 0);
         if (day === 0 || day === 6) { weekendCals += (m.calories || 0); weekendCount++; }
         else { weekdayCals += (m.calories || 0); weekdayCount++; }
      });

      const activeDays = new Set(meals.map(m => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size || 1;
      
      if (meals.length > 0 && breakfastCount < (activeDays * 0.4)) habits.push("Frequently skipping breakfast");
      if (monthlyMacros.calories > 0 && (lateNightCals / monthlyMacros.calories) > 0.25) habits.push("Late night snacking pattern detected");

      const avgWeekend = weekendCount ? (weekendCals / weekendCount) : 0;
      const avgWeekday = weekdayCount ? (weekdayCals / weekdayCount) : 0;
      if (avgWeekend > avgWeekday + 500) habits.push("Weekend caloric surplus detected (cheat days)");
      if (avgWeekday > 0 && avgWeekday < 500) habits.push("Losing diet tracking discipline on weekends");

      if (streak === 0 && (analytics?.thisMonthSummary?.count || 0) > 4) habits.push("Inconsistent training schedule (breaking streaks)");
      if (habits.length === 0) habits.push("Highly consistent daily routine");

      let archetype = "The Consistent Grinder";
      if (streak === 0 && workouts.length > 0) archetype = "The Sporadic Trainee";
      if (avgWeekend > avgWeekday + 800) archetype = "The Weekend Warrior";
      if (breakfastCount < (activeDays * 0.2)) archetype = "The Intermittent Faster";

      const result = {
        nutrition: {
          dailyCalories: todayMacros.calories,
          weeklyAverageCalories: weeklyAvgCals,
          monthlyAverageCalories: monthlyAvgCals,
          maintenanceCalories: maintenance,
          calorieTrend,
          proteinTarget: targetPro,
          proteinAverage: weeklyAvgPro,
          proteinCompliance: weeklyAvgPro >= targetPro,
          recentMealsEaten
        },
        workout: {
          weeklyWorkoutCount: recent7Workouts.length,
          monthlyWorkoutCount: recent28Workouts.length,
          totalTrainingVolume: analytics?.thisMonthSummary?.count || 0,
          acuteLoad: acuteVol,
          chronicLoad: chronicVol,
          ACWR: acwr,
          recoveryIndex,
          hasYoga,
          strengthCount,
          cardioCount
        },
        consistency: {
          workoutConsistency,
          mealConsistency,
          loggingConsistency,
          streak,
          missedDays: 7 - recent7Workouts.length
        },
        body: {
          plateauDetected: plateauDuration >= 14,
          plateauDuration,
          weightDelta7Days
        },
        behavior: {
          archetype,
          habits
        }
      };
      
      EngineDiagnostics.recordExecutionTime('BehaviorAnalysisEngine', Date.now() - startTime);
      return result;
      } catch (e) {
        console.error('BehaviorAnalysisEngine Critical Failure', e);
        return {
          nutrition: { dailyCalories: 0, weeklyAverageCalories: 0, monthlyAverageCalories: 0, maintenanceCalories: 2000, calorieTrend: 'Maintenance', proteinTarget: 150, proteinAverage: 0, proteinCompliance: false, recentMealsEaten: new Set() },
          workout: { weeklyWorkoutCount: 0, monthlyWorkoutCount: 0, totalTrainingVolume: 0, acuteLoad: 0, chronicLoad: 0, ACWR: 1.0, recoveryIndex: 100, hasYoga: false, strengthCount: 0, cardioCount: 0 },
          consistency: { workoutConsistency: 0, mealConsistency: 0, loggingConsistency: 0, streak: 0, missedDays: 0 },
          body: { plateauDetected: false, plateauDuration: 0, weightDelta7Days: 0 },
          behavior: { archetype: 'Unknown', habits: [] }
        };
      }
    });
  }
}
