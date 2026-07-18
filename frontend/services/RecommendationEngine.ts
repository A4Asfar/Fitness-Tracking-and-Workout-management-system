import { getStartOfDay, filterByDate, sumMacros, getCached } from './EngineUtils';

export interface RecommendationResult {
  actionPlan: { task: string; reason: string; completed: boolean }[];
  adaptiveDiet: { recommendedMeal: string; reason: string; evidence: string; expectedOutcome: string; targetMacro: string; originalMacro: string } | null;
  adaptiveWorkout: { recommendedWorkout: string; reason: string; evidence: string; expectedOutcome: string } | null;
  goalAdjustment: { isUnrealistic: boolean; safeTimeline: string; reason: string } | null;
  notifications: string[];
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
    this.clearCache();

    const todayMeals = filterByDate(meals, 0);

    const actionPlan = this.generateActionPlan(user, analytics, todayMeals, predictiveData);
    const adaptiveDiet = this.generateAdaptiveDiet(user, meals, predictiveData);
    const adaptiveWorkout = this.generateAdaptiveWorkout(analytics, predictiveData, workouts);
    const goalAdjustment = this.generateGoalAdjustment(user, predictiveData);
    const notifications = this.generateNotifications(todayMeals, analytics, user, predictiveData, meals);

    return { actionPlan, adaptiveDiet, adaptiveWorkout, goalAdjustment, notifications };
  }

  private generateActionPlan(user: any, analytics: any, todayMeals: any[], predictiveData: any) {
    return getCached(todayMeals, 'generateActionPlan', () => {
       const plan = [];
       const targetPro = user?.weight ? Math.round(user.weight * 2) : 150;
       const currentPro = todayMeals.reduce((a,b)=>a+(b.protein||0),0);
       
       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          plan.push({ task: 'Complete a Mobility or Recovery Walk', reason: 'High burnout risk detected from overtraining.', completed: false });
       } else {
          const countThisWeek = analytics?.thisWeekSummary?.count || 0;
          plan.push({ task: 'Complete Strength Session', reason: `You have only completed ${countThisWeek} workouts this week.`, completed: false });
       }

       if (currentPro >= targetPro) {
          plan.push({ task: `Hit Protein Target (${targetPro}g)`, reason: `Muscle recovery optimized.`, completed: true });
       } else {
          plan.push({ task: `Consume ${targetPro - currentPro}g more Protein`, reason: `Protein intake is required for muscle preservation.`, completed: false });
       }

       plan.push({ task: 'Drink 2.5L Water', reason: 'Hydration speeds up metabolic clearance.', completed: false });
       plan.push({ task: 'Sleep at least 8 hours', reason: 'Deep sleep prevents hormonal plateau.', completed: false });

       const maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
       const currentCals = todayMeals.reduce((a,b)=>a+(b.calories||0),0);
       if (currentCals > maintenance) plan.push({ task: `Stop eating (Calorie Limit Exceeded)`, reason: `You are in a dangerous surplus.`, completed: true });
       else plan.push({ task: `Stay below ${maintenance} kcal`, reason: `Keep your caloric balance stabilized.`, completed: false });

       return plan;
    });
  }

  private generateAdaptiveDiet(user: any, meals: any[], predictiveData: any) {
    return getCached(meals, 'generateAdaptiveDiet', () => {
       const maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
       const past14DaysMeals = filterByDate(meals, 14);
       const macros = sumMacros(past14DaysMeals);
       
       const daysTracked = new Set(past14DaysMeals.map(m => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size || 1;
       const avgCals = macros.calories / daysTracked;
       const avgPro = macros.protein / daysTracked;
       const targetPro = user?.weight ? Math.round(user.weight * 2) : 150;

       let bestMeal = null;
       let bestScore = 0;
       meals.forEach(m => {
          const cal = m.calories || 1;
          const pro = m.protein || 0;
          const ratio = pro / cal; 
          if (ratio > bestScore && cal > 100) {
             bestScore = ratio;
             bestMeal = m;
          }
       });

       if (avgCals > maintenance + 200) {
          return {
             recommendedMeal: bestMeal ? (bestMeal as any).name : 'Diet Plan Default Meal',
             reason: `Decrease daily calorie load while preserving muscle.`,
             evidence: `You averaged ${Math.round(avgCals)} kcal over the last 14 days while your maintenance is ${Math.round(maintenance)} kcal.`,
             expectedOutcome: 'Decreases daily caloric load and restores deficit.',
             targetMacro: bestMeal ? `${(bestMeal as any).protein}g Protein | ${(bestMeal as any).calories} kcal` : '30g Protein | 400 kcal',
             originalMacro: `Avg Daily Intake: ${Math.round(avgCals)} kcal`
          };
       } else if (avgPro < targetPro - 20) {
          return {
             recommendedMeal: bestMeal ? (bestMeal as any).name : 'High Protein Snack',
             reason: `Increase daily protein intake for muscle recovery.`,
             evidence: `You averaged ${Math.round(avgPro)}g protein over the last 14 days while your target is ${targetPro}g. Increase daily protein by ${Math.round(targetPro - avgPro)}g.`,
             expectedOutcome: 'Enhances muscle protein synthesis.',
             targetMacro: bestMeal ? `${(bestMeal as any).protein}g Protein` : `${targetPro}g Target Protein`,
             originalMacro: `Avg Daily Protein: ${Math.round(avgPro)}g`
          };
       }

       return null;
    });
  }

  private generateAdaptiveWorkout(analytics: any, predictiveData: any, workouts: any[]) {
    return getCached(workouts, 'generateAdaptiveWorkout', () => {
       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          return {
             recommendedWorkout: 'Mobility & Stretching',
             reason: 'Burnout risk is critically high. Avoid intense nervous system fatigue today.',
             evidence: `Burnout score is ${predictiveData.burnout.score}. Training load is excessive relative to recovery.`,
             expectedOutcome: 'Restores Central Nervous System balance and prevents injury.'
          };
       }

       const recentWorkouts = filterByDate(workouts, 7);
       const countThisWeek = recentWorkouts.length;
       if (countThisWeek === 0) {
          return {
             recommendedWorkout: 'Full Body Foundations',
             reason: 'You have missed training recently. Re-establish base strength.',
             evidence: `0 workouts logged in the last 7 days.`,
             expectedOutcome: 'Re-primes muscle fibers without causing extreme DOMS.'
          };
       }

       let strengthCount = 0;
       let cardioCount = 0;
       recentWorkouts.forEach(w => {
          if (w.type === 'Strength') strengthCount++;
          if (w.type === 'Cardio' || w.type === 'HIIT') cardioCount++;
       });

       if (strengthCount >= 3 && cardioCount === 0) {
          return {
             recommendedWorkout: 'Zone 2 Cardio',
             reason: 'You have high strength volume but low cardiovascular conditioning.',
             evidence: `You completed ${strengthCount} strength sessions this week but 0 cardio sessions.`,
             expectedOutcome: 'Improves aerobic base and recovery capacity.'
          };
       }

       if (cardioCount >= 3 && strengthCount === 0) {
          return {
             recommendedWorkout: 'Resistance Training',
             reason: 'You have high cardio volume but no resistance training.',
             evidence: `You completed ${cardioCount} cardio sessions this week but 0 strength sessions.`,
             expectedOutcome: 'Preserves muscle mass and improves metabolic rate.'
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

  private generateNotifications(todayMeals: any[], analytics: any, user: any, predictiveData: any, meals: any[]) {
    return getCached(meals, 'generateNotifications', () => {
       const notifications = [];
       const hasBreakfast = todayMeals.some(m => (m.mealType || m.category) === 'Breakfast');
       if (!hasBreakfast && new Date().getHours() > 10) {
          notifications.push("Breakfast Missing: Fuel your morning to prevent energy crashes.");
       }
       
       const targetPro = user?.weight ? Math.round(user.weight * 2) : 150;
       const currentPro = todayMeals.reduce((a,b)=>a+(b.protein||0),0);
       if (currentPro < targetPro) {
          notifications.push(`Protein Target Remaining: You need ${targetPro - currentPro}g more today.`);
       } else {
          notifications.push("Protein Target Achieved: Excellent muscle recovery support.");
       }
       
       const countThisWeek = analytics?.thisWeekSummary?.count || 0;
       if (countThisWeek === 0) {
          notifications.push("Workout Reminder: No sessions logged this week. Start today!");
       }

       if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
          notifications.push("Recovery Warning: Critical fatigue detected. Take a rest day.");
       }

       const maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
       const avgCals = meals.slice(-7).reduce((a,b)=>a+(b.calories||0),0) / 7;
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
