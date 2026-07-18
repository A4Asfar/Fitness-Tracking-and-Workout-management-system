import { getStartOfDay, filterByDate, sumMacros, getCached, calculateMaintenance, calculateTargetProtein } from './EngineUtils';
import BehaviorAnalysisEngine from './BehaviorAnalysisEngine';
import EngineDiagnostics from './EngineDiagnostics';

export interface RecommendationResult {
  actionPlan: { task: string; reason: string; completed: boolean }[];
  adaptiveDiet: { recommendedMeal: string; reason: string; evidence: string; expectedOutcome: string; targetMacro: string; originalMacro: string; confidenceScore: number; confidenceReasons?: string[] } | null;
  adaptiveWorkout: { recommendedWorkout: string; reason: string; evidence: string; expectedOutcome: string; confidenceScore: number; confidenceReasons?: string[] } | null;
  goalAdjustment: { isUnrealistic: boolean; safeTimeline: string; reason: string } | null;
  notifications: string[];
  diagnostics?: any;
}

class RecommendationEngine {
  private static instance: RecommendationEngine;
  private memoCache: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  public clearCache() {
    this.memoCache.clear();
  }

  public generate(user: any, analytics: any, meals: any[], predictiveData: any, workouts: any[] = []): RecommendationResult {
    try {
      this.clearCache();
      const startTime = Date.now();
      const now = new Date();
      const b = BehaviorAnalysisEngine.generate(user, analytics, meals, [], workouts);
      const todayMeals = filterByDate(meals, 0);

      const actionPlan = this.generateActionPlan(user, analytics, todayMeals, predictiveData, b);
      const adaptiveDiet = this.generateAdaptiveDiet(user, meals, predictiveData, b);
      const adaptiveWorkout = this.generateAdaptiveWorkout(analytics, predictiveData, workouts, b);
      const goalAdjustment = this.generateGoalAdjustment(user, predictiveData);
      const notifications = this.generateNotifications(todayMeals, analytics, user, predictiveData, meals, b, now);

      const diagnostics = EngineDiagnostics.getSnapshot();
      EngineDiagnostics.recordExecutionTime('RecommendationEngine', Date.now() - startTime);

      return { actionPlan, adaptiveDiet, adaptiveWorkout, goalAdjustment, notifications, diagnostics };
    } catch (e) {
      console.error('RecommendationEngine Critical Failure', e);
      return {
        actionPlan: [],
        adaptiveDiet: null,
        adaptiveWorkout: null,
        goalAdjustment: null,
        notifications: ['Recommendations temporarily unavailable']
      };
    }
  }

  private generateActionPlan(user: any, analytics: any, todayMeals: any[], predictiveData: any, b: any) {
    return getCached(todayMeals, 'generateActionPlan', () => {
       const plan = [];
       const targetPro = b.nutrition.proteinTarget;
       const currentPro = sumMacros(todayMeals).protein;
       
       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          plan.push({ task: 'Complete a Mobility or Recovery Walk', reason: 'High burnout risk detected from overtraining.', completed: false });
       } else {
          const countThisWeek = b.workout.weeklyWorkoutCount;
          plan.push({ task: 'Complete Strength Session', reason: `You have only completed ${countThisWeek} workouts this week.`, completed: false });
       }

       if (currentPro >= targetPro) {
          plan.push({ task: `Hit Protein Target (${targetPro}g)`, reason: `Muscle recovery optimized.`, completed: true });
       } else {
          plan.push({ task: `Consume ${Math.round(targetPro - currentPro)}g more Protein`, reason: `Protein intake is required for muscle preservation.`, completed: false });
       }

       plan.push({ task: 'Drink 2.5L Water', reason: 'Hydration speeds up metabolic clearance.', completed: false });
       plan.push({ task: 'Sleep at least 8 hours', reason: 'Deep sleep prevents hormonal plateau.', completed: false });

       const maintenance = b.nutrition.maintenanceCalories;
       const currentCals = b.nutrition.dailyCalories;
       if (currentCals > maintenance) plan.push({ task: `Stop eating (Calorie Limit Exceeded)`, reason: `You are in a dangerous surplus.`, completed: true });
       else plan.push({ task: `Stay below ${maintenance} kcal`, reason: `Keep your caloric balance stabilized.`, completed: false });

       return plan;
    });
  }

  private generateAdaptiveDiet(user: any, meals: any[], predictiveData: any, b: any) {
    return getCached(meals, 'generateAdaptiveDiet', () => {
       const maintenance = b.nutrition.maintenanceCalories;
       const avgCals = b.nutrition.weeklyAverageCalories;
       const avgPro = b.nutrition.proteinAverage;
       const targetPro = b.nutrition.proteinTarget;

       let bestMeal = null;
       let bestScore = 0;
       
       const recentlyEaten = b.nutrition.recentMealsEaten;

       meals.forEach(m => {
          const cal = m.calories || 1;
          const pro = m.protein || 0;
          let ratio = pro / cal; 
          
          if (recentlyEaten.has(m.name)) ratio *= 0.5; 
          
          if (ratio > bestScore && cal > 100) {
             bestScore = ratio;
             bestMeal = m;
          }
       });

       const confidenceScore = b.consistency.mealConsistency / 100;

       if (avgCals > maintenance + 200) {
          return {
             recommendedMeal: bestMeal ? (bestMeal as any).name : 'Diet Plan Default Meal',
             reason: `Decrease daily calorie load while preserving muscle.`,
             evidence: `You averaged ${Math.round(avgCals)} kcal over the last 7 days while your maintenance is ${Math.round(maintenance)} kcal.`,
             expectedOutcome: 'Decreases daily caloric load and restores deficit.',
             targetMacro: bestMeal ? `${(bestMeal as any).protein}g Protein | ${(bestMeal as any).calories} kcal` : '30g Protein | 400 kcal',
             originalMacro: `Avg Daily Intake: ${Math.round(avgCals)} kcal`,
             confidenceScore,
             confidenceReasons: [
                `✓ High confidence derived from meal tracking consistency (${confidenceScore * 100}%)`,
                `⚠ Sustained calorie surplus averaging ${Math.round(avgCals)} kcal`
             ]
          };
       } else if (avgPro < targetPro - 20) {
          return {
             recommendedMeal: bestMeal ? (bestMeal as any).name : 'High Protein Snack',
             reason: `Increase daily protein intake for muscle recovery.`,
             evidence: `You averaged ${Math.round(avgPro)}g protein over the last 7 days while your target is ${targetPro}g. Increase daily protein by ${Math.round(targetPro - avgPro)}g.`,
             expectedOutcome: 'Enhances muscle protein synthesis.',
             targetMacro: bestMeal ? `${(bestMeal as any).protein}g Protein` : `${targetPro}g Target Protein`,
             originalMacro: `Avg Daily Protein: ${Math.round(avgPro)}g`,
             confidenceScore,
             confidenceReasons: [
                `✓ High confidence derived from meal tracking consistency (${confidenceScore * 100}%)`,
                `⚠ Protein intake is below muscle preservation threshold (${Math.round(avgPro)}g / ${targetPro}g)`
             ]
          };
       }

       return null;
    });
  }

  private generateAdaptiveWorkout(analytics: any, predictiveData: any, workouts: any[], b: any) {
    return getCached(workouts, 'generateAdaptiveWorkout', () => {
       const confidenceScore = b.consistency.workoutConsistency / 100;
       
       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          const hasYoga = b.workout.hasYoga;
          return {
             recommendedWorkout: hasYoga ? 'Active Recovery Yoga' : 'Mobility & Stretching',
             reason: 'Burnout risk is critically high. Avoid intense nervous system fatigue today.',
             evidence: `Burnout score is ${predictiveData.burnout.score}. Training load is excessive relative to recovery.`,
             expectedOutcome: 'Restores Central Nervous System balance and prevents injury.',
             confidenceScore: 0.95,
             confidenceReasons: [
                `✓ Burnout prevention protocol overrides standard algorithm`,
                `⚠ Critical overtraining signals detected`
             ]
          };
       }

       const countThisWeek = b.workout.weeklyWorkoutCount;
       if (countThisWeek === 0) {
          return {
             recommendedWorkout: 'Full Body Foundations',
             reason: 'You have missed training recently. Re-establish base strength.',
             evidence: `0 workouts logged in the last 7 days.`,
             expectedOutcome: 'Re-primes muscle fibers without causing extreme DOMS.',
             confidenceScore,
             confidenceReasons: [
                `⚠ Missing recent workout volume`,
                `✓ Low-intensity foundation selected to prevent injury`
             ]
          };
       }

       const strengthCount = b.workout.strengthCount;
       const cardioCount = b.workout.cardioCount;

       if (strengthCount >= 3 && cardioCount === 0) {
          return {
             recommendedWorkout: 'Zone 2 Cardio',
             reason: 'You have high strength volume but low cardiovascular conditioning.',
             evidence: `You completed ${strengthCount} strength sessions this week but 0 cardio sessions.`,
             expectedOutcome: 'Improves aerobic base and recovery capacity.',
             confidenceScore,
             confidenceReasons: [
                `✓ Historical density validates high strength volume (${strengthCount} sessions)`,
                `⚠ 0 cardiovascular endurance conditioning detected`
             ]
          };
       }

       if (cardioCount >= 3 && strengthCount === 0) {
          return {
             recommendedWorkout: 'Resistance Training',
             reason: 'You have high cardio volume but no resistance training.',
             evidence: `You completed ${cardioCount} cardio sessions this week but 0 strength sessions.`,
             expectedOutcome: 'Preserves muscle mass and improves metabolic rate.',
             confidenceScore,
             confidenceReasons: [
                `✓ Historical density validates high cardio volume (${cardioCount} sessions)`,
                `⚠ 0 resistance training sessions detected`
             ]
          };
       }

       return null;
    });
  }

  private generateGoalAdjustment(user: any, predictiveData: any) {
     const diff = Math.abs((user?.weight || 70) - (user?.targetWeight || 70));
     if (diff > 10 && predictiveData.goalSuccess.probabilityPct < 20) {
        return {
           isUnrealistic: true,
           safeTimeline: `${Math.ceil(diff / 0.5)} Weeks`,
           reason: `Attempting to drop ${diff}kg rapidly is triggering muscle loss algorithms. A safe 0.5kg/week velocity is required.`
        };
     }
     return null;
  }

  private generateNotifications(todayMeals: any[], analytics: any, user: any, predictiveData: any, meals: any[], b: any, now: Date) {
    return getCached(meals, 'generateNotifications', () => {
       const notifications = [];
       const hasBreakfast = todayMeals.some(m => (m.mealType || m.category) === 'Breakfast');
       if (!hasBreakfast && now.getHours() > 10) {
          notifications.push("Breakfast Missing: Fuel your morning to prevent energy crashes.");
       }
       
       const targetPro = b.nutrition.proteinTarget;
       const currentPro = sumMacros(todayMeals).protein;
       if (currentPro < targetPro) {
          notifications.push(`Protein Target Remaining: You need ${Math.round(targetPro - currentPro)}g more today.`);
       } else {
          notifications.push("Protein Target Achieved: Excellent muscle recovery support.");
       }
       
       const countThisWeek = b.workout.weeklyWorkoutCount;
       if (countThisWeek === 0) {
          notifications.push("Workout Reminder: No sessions logged this week. Start today!");
       }

       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          notifications.push("Recovery Warning: Critical fatigue detected. Take a rest day.");
       }

       const maintenance = b.nutrition.maintenanceCalories;
       const avgCals = b.nutrition.weeklyAverageCalories;
       if (avgCals > maintenance + 300) {
          notifications.push(`Calorie Surplus Warning: You are averaging ${Math.round(avgCals - maintenance)} kcal over maintenance.`);
       } else if (avgCals > 0 && avgCals < maintenance - 800) {
          notifications.push(`Calorie Deficit Warning: Severe undereating detected (${Math.round(avgCals)} kcal avg).`);
       }

       return notifications;
    });
  }
}

export default RecommendationEngine.getInstance();
