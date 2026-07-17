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

  public generate(user: any, analytics: any, meals: any[], predictiveData: any): RecommendationResult {
    this.clearCache();

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayMeals = meals.filter(m => {
       const md = new Date(m.selectedAt || m.createdAt || m.date);
       md.setHours(0,0,0,0);
       return md.getTime() === today.getTime();
    });

    const actionPlan = this.generateActionPlan(user, analytics, todayMeals, predictiveData);
    const adaptiveDiet = this.generateAdaptiveDiet(user, meals, predictiveData);
    const adaptiveWorkout = this.generateAdaptiveWorkout(analytics, predictiveData);
    const goalAdjustment = this.generateGoalAdjustment(user, predictiveData);
    const notifications = this.generateNotifications(todayMeals, analytics, user);

    return { actionPlan, adaptiveDiet, adaptiveWorkout, goalAdjustment, notifications };
  }

  private generateActionPlan(user: any, analytics: any, todayMeals: any[], predictiveData: any) {
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
  }

  private generateAdaptiveDiet(user: any, meals: any[], predictiveData: any) {
     if (predictiveData.predictions.caloricTrend !== 'Surplus') return null;

     let bestMeal = null;
     let worstMeal = null;
     let bestScore = 0;
     let worstScore = 999;
     
     meals.forEach(m => {
        const cal = m.calories || 1;
        const pro = m.protein || 0;
        const ratio = pro / cal; 
        if (ratio > bestScore && cal < 500 && pro > 30) {
           bestScore = ratio;
           bestMeal = m;
        }
        if (ratio < worstScore && cal > 600) {
           worstScore = ratio;
           worstMeal = m;
        }
     });

     if (bestMeal && worstMeal) {
        return {
           recommendedMeal: (bestMeal as any).name || 'Chicken & Greens Salad',
           reason: 'You are repeatedly exceeding calories. This meal from your history has a significantly better protein-to-calorie ratio.',
           evidence: `Average daily calories currently exceed maintenance by 300+.`,
           expectedOutcome: 'Decreases daily caloric load while preserving muscle mass.',
           targetMacro: `${(bestMeal as any).protein}g Protein | ${(bestMeal as any).calories} kcal`,
           originalMacro: `${(worstMeal as any).name || 'Heavy Meal'}: ${(worstMeal as any).calories} kcal`
        };
     }

     return {
        recommendedMeal: 'Lean Chicken Wrap',
        reason: 'You are repeatedly exceeding calories. Recommend switching to lean wraps.',
        evidence: 'Consistent caloric surplus without proportional muscle gain.',
        expectedOutcome: 'Stable weight loss trajectory restored.',
        targetMacro: '40g Protein | 400 kcal',
        originalMacro: 'Current Average Meal: 650 kcal'
     };
  }

  private generateAdaptiveWorkout(analytics: any, predictiveData: any) {
     if (predictiveData.burnout.risk === 'Critical' || predictiveData.burnout.risk === 'High') {
        return {
           recommendedWorkout: 'Mobility & Stretching',
           reason: 'Burnout risk is critically high. Avoid intense nervous system fatigue today.',
           evidence: `Recovery score dropped below 50. Training load is excessive.`,
           expectedOutcome: 'Restores Central Nervous System balance and prevents injury.'
        };
     }

     const countThisWeek = analytics?.thisWeekSummary?.count || 0;
     if (countThisWeek === 0) {
        return {
           recommendedWorkout: 'Full Body Foundations',
           reason: 'You have missed all training sessions this week. Re-establish base strength.',
           evidence: `0 workouts logged in the last 5 days.`,
           expectedOutcome: 'Re-primes muscle fibers without causing extreme DOMS.'
        };
     }

     return null;
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

  private generateNotifications(todayMeals: any[], analytics: any, user: any) {
     const notifications = [];
     const hasBreakfast = todayMeals.some(m => (m.mealType || m.category) === 'Breakfast');
     if (!hasBreakfast && new Date().getHours() > 10) {
        notifications.push("You have not logged breakfast.");
     }
     const targetPro = user?.weight ? Math.round(user.weight * 2) : 150;
     const currentPro = todayMeals.reduce((a,b)=>a+(b.protein||0),0);
     if (currentPro < targetPro) {
        notifications.push(`Protein target still needs ${targetPro - currentPro}g.`);
     } else {
        notifications.push("Protein target achieved for today!");
     }
     const countThisWeek = analytics?.thisWeekSummary?.count || 0;
     if (countThisWeek === 0) {
        notifications.push("Today is your scheduled Workout session.");
     }
     return notifications;
  }
}

export default RecommendationEngine.getInstance();
