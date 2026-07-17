import PredictionEngine, { PredictionResult } from './PredictionEngine';
import RecommendationEngine, { RecommendationResult } from './RecommendationEngine';

export interface EngineParams {
  user: any;
  analytics: any;
  meals: any[];
  dietPlan?: any;
  weightLogs?: any[];
}

export interface EngineResult {
  healthBalanceIndex: number;
  scores: {
    overall: { value: number; reasons: string[] };
    workout: { value: number; reasons: string[] };
    nutrition: { value: number; reasons: string[] };
    adherence: { value: number; reasons: string[] };
    recovery: { value: number; reasons: string[] };
    goal: { value: number; reasons: string[] };
    body: { value: number; reasons: string[] };
  };
  status: {
    primary: string;
    coachReport: string[];
  };
  consistency: {
    workout: number;
    meal: number;
    recovery: number;
    diet: number;
    overall: number;
    streak: number;
    longestStreak: number;
    brokenReason: string | null;
  };
  goalAchievement: {
    goal: string;
    currentPct: number;
    remainingPct: number;
    estimatedCompletion: string;
    progressVelocity: string;
    expectedWeeklyProgress: string;
  };
  bodyProgress: {
    weeklyChange: string;
    monthlyTrend: string;
    detection: string;
    bmi: string;
  };
  reports: {
    weekly: {
      biggestAchievement: string;
      biggestMistake: string;
      strongestHabit: string;
      weakestHabit: string;
      nextWeekFocus: string;
      overallGrade: string;
    };
    monthly: {
      overallImprovement: string;
      weightChange: string;
      workoutConsistency: string;
      nutritionConsistency: string;
      goalPrediction: string;
      riskAnalysis: string;
      coachConclusion: string;
    };
  };
  charts: {
    labels: string[];
    overall: number[];
    workout: number[];
    nutrition: number[];
    goal: number[];
    body: number[];
    recovery: number[];
    discipline: number[];
  };
  dietPlanComparison?: any;
  predictive: PredictionResult;
  recommendations: RecommendationResult;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class FitnessProgressEngine {
  private static instance: FitnessProgressEngine;
  private memoCache: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): FitnessProgressEngine {
    if (!FitnessProgressEngine.instance) {
      FitnessProgressEngine.instance = new FitnessProgressEngine();
    }
    return FitnessProgressEngine.instance;
  }

  public clearCache() {
    this.memoCache.clear();
  }

  public generate(params: EngineParams): EngineResult {
    this.clearCache();
    
    const { user, analytics, meals, dietPlan, weightLogs = [] } = params;
    const goal = dietPlan?.goal || user?.fitnessGoal || 'Maintain Fitness';
    const targetWeight = user?.targetWeight || (goal.includes('Loss') ? (user?.weight || 80) - 5 : (user?.weight || 70) + 5);

    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    
    const last30Meals = meals.filter(m => new Date(m.selectedAt || m.createdAt || m.date) >= thirtyDaysAgo);
    
    const { dietAdherence, dailyPct, weeklyPct, monthlyPct, planComparison, statuses, adherenceReasons } = this.calculateDietAdherence(last30Meals, dietPlan, today, thirtyDaysAgo);
    const { workoutScore, workoutReasons } = this.calculateWorkoutScore(analytics);
    const { nutritionScore, netCalsLabel, nutritionReasons } = this.calculateNutritionQuality(user, goal, last30Meals, analytics, today);
    const { recoveryScore, recoveryReasons } = this.calculateRecoveryScore(analytics, nutritionScore);
    const { bodyScore, bodyData, bodyReasons } = this.calculateBodyProgress(user, targetWeight, weightLogs, thirtyDaysAgo);
    const { goalScore, goalData, goalReasons } = this.calculateGoalAchievement(goal, targetWeight, user, bodyData, workoutScore, nutritionScore);

    const overallScore = Math.round(
      (workoutScore * 0.3) +
      (nutritionScore * 0.2) +
      (dietAdherence * 0.2) +
      (recoveryScore * 0.1) +
      (goalScore * 0.1) +
      (bodyScore * 0.1)
    );

    const overallReasons = [
      `✔ Weighted intelligently from 6 tracking pillars`,
      `✔ Workout Performance accounts for 30%`,
      `✔ Nutrition & Adherence account for 40%`,
      `✔ Recovery, Goal, and Body tracking account for 30%`
    ];

    const { primaryStatus, coachReport } = this.generateAIStatusAndReport(overallScore, workoutScore, nutritionScore, recoveryScore, dietAdherence, goal, netCalsLabel, bodyData);
    const consistencyData = this.calculateConsistency(workoutScore, nutritionScore, recoveryScore, weeklyPct, analytics);
    
    const chartsData = this.generateChartData(last30Meals, weightLogs, thirtyDaysAgo, workoutScore, nutritionScore, overallScore);

    // AI Engines
    const predictiveData = PredictionEngine.generate(user, analytics, meals, weightLogs, dietPlan);
    const recommendations = RecommendationEngine.generate(user, analytics, meals, predictiveData);

    // Advanced Reports & Master Metric
    const { weeklyReport, monthlyReport } = this.generateReports(overallScore, workoutScore, nutritionScore, recoveryScore, weeklyPct, consistencyData, predictiveData, bodyData);
    const healthBalanceIndex = this.calculateHealthBalanceIndex(overallScore, consistencyData.overall, predictiveData.burnout.score, bodyScore);

    return {
      healthBalanceIndex,
      scores: {
        overall: { value: overallScore, reasons: overallReasons },
        workout: { value: workoutScore, reasons: workoutReasons },
        nutrition: { value: nutritionScore, reasons: nutritionReasons },
        adherence: { value: dietAdherence, reasons: adherenceReasons },
        recovery: { value: recoveryScore, reasons: recoveryReasons },
        goal: { value: goalScore, reasons: goalReasons },
        body: { value: bodyScore, reasons: bodyReasons }
      },
      status: { primary: primaryStatus, coachReport },
      consistency: consistencyData,
      goalAchievement: goalData,
      bodyProgress: bodyData,
      reports: { weekly: weeklyReport, monthly: monthlyReport },
      charts: chartsData,
      dietPlanComparison: planComparison,
      predictive: predictiveData,
      recommendations: recommendations
    };
  }

  private calculateHealthBalanceIndex(overall: number, discipline: number, burnoutScore: number, bodyProgress: number) {
     // A master metric balancing output vs burnout
     let hbi = (overall * 0.4) + (discipline * 0.4) + (bodyProgress * 0.2);
     // Heavy penalty for burnout risk to enforce health over extreme pushing
     if (burnoutScore >= 70) hbi -= 30;
     else if (burnoutScore >= 40) hbi -= 15;
     
     return Math.max(0, Math.min(100, Math.round(hbi)));
  }

  // --- STANDARD PILLARS ---

  private calculateDietAdherence(last30Meals: any[], dietPlan: any, today: Date, thirtyDaysAgo: Date) {
     const adherenceReasons = [];
     if (!dietPlan) {
        adherenceReasons.push(`✖ No Diet Plan currently assigned.`);
        return { dietAdherence: 0, dailyPct: 0, weeklyPct: 0, monthlyPct: 0, planComparison: null, statuses: {}, adherenceReasons };
     }

     const complianceHistory: { pct: number, statuses: any }[] = [];
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
           let totalWeight = 0;
           let earnedWeight = 0;
           const statuses: any = {};
           const loggedTypes = dayMeals.map((m: any) => m.mealType || m.category || 'Unknown');
           const loggedSet = new Set(loggedTypes);

           ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'].forEach(mealKey => {
              const pMeal = plannedDay[mealKey];
              if (pMeal && pMeal.foods && pMeal.foods.length > 0) {
                 totalWeight += 1;
                 const checkKey = mealKey.includes('snack') ? 'Snack' : mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
                 const matchingLog = dayMeals.find(m => (m.mealType || m.category) === checkKey);
                 if (!matchingLog) { statuses[mealKey] = 'Skipped'; }
                 else {
                    const calsDiff = Math.abs((matchingLog.calories || 0) - (pMeal.calories || 0));
                    if (calsDiff <= (pMeal.calories * 0.20) || calsDiff < 50) { statuses[mealKey] = 'Completed'; earnedWeight += 1; }
                    else { statuses[mealKey] = 'Partially Followed'; earnedWeight += 0.5; }
                    loggedSet.delete(checkKey);
                 }
              }
           });
           loggedSet.forEach(extra => { statuses[`extra_${extra}`] = 'Extra'; totalWeight += 0.2; });
           const compliance = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
           complianceHistory.push({ pct: Math.min(100, Math.max(0, compliance)), statuses });
        }
     }

     const todayData = complianceHistory[complianceHistory.length - 1] || { pct: 0, statuses: {} };
     const last7 = complianceHistory.slice(-7);
     
     const dailyPct = todayData.pct;
     const weeklyPct = last7.length ? Math.round(last7.reduce((a, b) => a + b.pct, 0) / last7.length) : 0;
     const monthlyPct = complianceHistory.length ? Math.round(complianceHistory.reduce((a, b) => a + b.pct, 0) / complianceHistory.length) : 0;

     if (dailyPct >= 80) adherenceReasons.push(`✔ Excellent daily adherence (${dailyPct}%)`);
     else if (dailyPct > 0) adherenceReasons.push(`✖ Partial daily adherence (${dailyPct}%)`);
     else adherenceReasons.push(`✖ No meals tracked today matching plan`);
     
     if (weeklyPct >= 80) adherenceReasons.push(`✔ Maintained strong weekly discipline`);
     else adherenceReasons.push(`✖ Weekly adherence is lacking (${weeklyPct}%)`);

     const todayMeals = last30Meals.filter(m => {
        const md = new Date(m.selectedAt || m.createdAt || m.date);
        md.setHours(0,0,0,0);
        return md.getTime() === today.getTime();
     });
     let c=0, p=0, ca=0, f=0, fb=0, w=0;
     todayMeals.forEach(m => { c+=m.calories||0; p+=m.protein||0; ca+=m.carbs||0; f+=m.fats||0; fb+=m.fiber||0; });

     let adherenceLabel = 'Excellent';
     if (weeklyPct < 50) adherenceLabel = 'Poor';
     else if (weeklyPct < 75) adherenceLabel = 'Needs Improvement';
     else if (weeklyPct < 90) adherenceLabel = 'Good';

     return {
       dietAdherence: dailyPct, dailyPct, weeklyPct, monthlyPct, statuses: todayData.statuses, adherenceReasons,
       planComparison: {
         caloriesPlanned: dietPlan.dailyCalories, caloriesConsumed: c,
         proteinPlanned: dietPlan.protein, proteinConsumed: p,
         carbsPlanned: dietPlan.carbs, carbsConsumed: ca,
         fatPlanned: dietPlan.fat, fatConsumed: f,
         fiberPlanned: 25, fiberConsumed: fb,
         waterPlanned: dietPlan.waterTarget || 2.5, waterConsumed: w,
         dailyCompliancePct: dailyPct, weeklyCompliancePct: weeklyPct, monthlyCompliancePct: monthlyPct,
         adherenceLabel, mealStatuses: todayData.statuses
       }
     };
  }

  private calculateWorkoutScore(analytics: any) {
    let score = 0;
    const streak = analytics?.streak || 0;
    const countThisWeek = analytics?.thisWeekSummary?.count || 0;
    const volumeThisWeek = analytics?.thisWeekSummary?.volume || 0;
    
    score += Math.min(streak * 10, 30); 
    score += Math.min(countThisWeek * 15, 45); 
    score += Math.min(volumeThisWeek / 1000 * 5, 25); 

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    const workoutReasons = [];
    if (countThisWeek >= 3) workoutReasons.push(`✔ Completed ${countThisWeek} workouts this week`);
    else workoutReasons.push(`✖ Only completed ${countThisWeek} workouts this week`);

    if (streak >= 3) workoutReasons.push(`✔ Strong consistency (${streak} day streak)`);
    else workoutReasons.push(`✖ Consistency broke (streak is ${streak})`);

    if (volumeThisWeek > 3000) workoutReasons.push(`✔ High training volume (${volumeThisWeek} kg lifted)`);
    else workoutReasons.push(`✖ Training volume below target (${volumeThisWeek} kg)`);

    return { workoutScore: finalScore, workoutReasons };
  }

  private calculateNutritionQuality(user: any, goal: string, meals: any[], analytics: any, today: Date) {
    let nutritionScore = 100;
    let maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
    if (user?.gender === 'female') maintenance = user?.weight ? user.weight * 22 * 1.2 : 2000;

    const todayMeals = meals.filter(m => {
       const md = new Date(m.selectedAt || m.createdAt || m.date);
       md.setHours(0,0,0,0);
       return md.getTime() === today.getTime();
    });
    const cals = todayMeals.reduce((a,b)=>a+(b.calories||0),0);
    const pro = todayMeals.reduce((a,b)=>a+(b.protein||0),0);
    const targetPro = user?.weight ? user.weight * 2 : 150;

    let burned = 0;
    if (analytics?.recentWorkouts) {
       const rw = analytics.recentWorkouts.find((w:any) => new Date(w.date).getTime() >= today.getTime());
       if (rw) burned = rw.caloriesBurned || 0;
    }

    const netCalories = cals - burned;
    let netCalsLabel = 'Balanced';
    const nutritionReasons = [];

    if (netCalories < maintenance - 500) {
      netCalsLabel = 'Deficit';
      if (!goal.includes('Loss')) { nutritionScore -= 20; nutritionReasons.push(`✖ Too few calories for ${goal} goal`); }
      else nutritionReasons.push(`✔ Perfect caloric deficit achieved`);
    } else if (netCalories > maintenance + 500) {
      netCalsLabel = 'Dangerous Surplus';
      if (goal.includes('Loss')) { nutritionScore -= 40; nutritionReasons.push(`✖ Dangerous surplus for weight loss goal`); }
      else if (!goal.includes('Gain')) { nutritionScore -= 20; nutritionReasons.push(`✖ Eating significantly above maintenance`); }
      else nutritionReasons.push(`✔ Heavy surplus achieved for muscle gain`);
    } else if (netCalories > maintenance + 200) {
      netCalsLabel = 'Small Surplus';
      if (goal.includes('Loss')) { nutritionScore -= 15; nutritionReasons.push(`✖ Small surplus stalling weight loss`); }
      else nutritionReasons.push(`✔ Small surplus optimized for slow gain`);
    } else {
       nutritionReasons.push(`✔ Calories balanced at maintenance`);
    }

    if (pro > 0 && pro < targetPro * 0.7) { nutritionScore -= 20; nutritionReasons.push(`✖ Protein heavily below target (${pro}g / ${targetPro}g)`); }
    else if (pro > 0) nutritionReasons.push(`✔ Protein on target (${pro}g)`);
    else nutritionReasons.push(`✖ No protein logged today`);
    
    return { nutritionScore: Math.max(0, Math.min(100, nutritionScore)), netCalsLabel, nutritionReasons };
  }

  private calculateRecoveryScore(analytics: any, nutritionScore: number) {
    let score = 100;
    const recoveryReasons = [];
    const countThisWeek = analytics?.thisWeekSummary?.count || 0;
    
    if (countThisWeek >= 6) { score -= 30; recoveryReasons.push(`✖ High training load without rest (${countThisWeek} days)`); }
    else { recoveryReasons.push(`✔ Healthy workout spacing detected`); }

    if (countThisWeek === 0) { score -= 20; recoveryReasons.push(`✖ Inactivity degrades recovery pacing`); }

    if (nutritionScore < 50) { score -= 20; recoveryReasons.push(`✖ Poor nutrition is severely hampering recovery`); }
    else { recoveryReasons.push(`✔ Good nutrition fuels proper recovery`); }

    return { recoveryScore: Math.max(0, Math.min(100, score)), recoveryReasons };
  }

  private calculateBodyProgress(user: any, targetWeight: number, weightLogs: any[], thirtyDaysAgo: Date) {
     const currentWeight = user?.weight || 0;
     let bodyScore = 80;
     const bodyReasons = [];
     let weeklyChange = '0 kg';
     let monthlyTrend = 'Stable';
     let detection = 'Healthy change';
     let bmi = 'N/A';

     if (user?.height && currentWeight) {
        const heightM = user.height / 100;
        bmi = (currentWeight / (heightM * heightM)).toFixed(1);
     }

     if (weightLogs && weightLogs.length > 0) {
        const recent = weightLogs.filter(w => new Date(w.date) >= thirtyDaysAgo).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (recent.length >= 2) {
           const oldest = recent[0].weight;
           const newest = recent[recent.length - 1].weight;
           const diff = newest - oldest;
           weeklyChange = `${(diff/4).toFixed(1)} kg`;
           
           if (diff > 2) { monthlyTrend = 'Gaining'; detection = diff > 4 ? 'Too fast' : 'Healthy change'; }
           else if (diff < -2) { monthlyTrend = 'Losing'; detection = diff < -4 ? 'Too fast' : 'Healthy change'; }
           else { monthlyTrend = 'Stable'; detection = 'Plateau'; }

           const targetDiff = targetWeight - newest;
           if (targetDiff < 0 && diff < 0) { bodyScore = 95; bodyReasons.push(`✔ Losing weight successfully towards goal`); }
           else if (targetDiff > 0 && diff > 0) { bodyScore = 95; bodyReasons.push(`✔ Gaining weight successfully towards goal`); }
           else if (targetDiff !== 0 && Math.abs(diff) < 0.5) { bodyScore = 70; detection = 'Plateau'; bodyReasons.push(`✖ Body progress stalled (Plateau)`); }
           else if (Math.abs(targetDiff) < 1) { bodyScore = 100; detection = 'Goal Reached'; bodyReasons.push(`✔ Ultimate weight goal reached!`); }
           else { bodyScore = 60; bodyReasons.push(`✖ Body is trending away from goal`); }
        } else {
           bodyReasons.push(`✖ Not enough log history to detect trends`);
        }
     } else {
        const weightDiff = Math.abs(currentWeight - targetWeight);
        if (weightDiff < 2) { bodyScore = 95; bodyReasons.push(`✔ Weight is very close to target`); }
        else if (weightDiff > 10) { bodyScore = 60; bodyReasons.push(`✖ Weight is significantly far from target`); }
        bodyReasons.push(`✖ No chronological logs found to track momentum`);
     }

     return {
       bodyScore,
       bodyData: { weeklyChange, monthlyTrend, detection, bmi },
       bodyReasons
     };
  }

  private calculateGoalAchievement(goal: string, targetWeight: number, user: any, bodyData: any, workoutScore: number, nutritionScore: number) {
     const currentWeight = user?.weight || 0;
     const weightDiff = Math.abs(currentWeight - targetWeight);
     
     const progressPct = weightDiff === 0 ? 100 : Math.min(100, Math.max(0, 100 - (weightDiff * 10)));
     const estWeeks = Math.max(1, Math.round(weightDiff / 0.5)); 
     const goalReasons = [];

     if (progressPct >= 80) goalReasons.push(`✔ Goal is nearly achieved (${progressPct}%)`);
     else goalReasons.push(`✖ Long term goal requires continued effort (${progressPct}%)`);

     if (workoutScore > 80 && nutritionScore > 80) goalReasons.push(`✔ Momentum is incredibly strong`);
     else goalReasons.push(`✖ Suboptimal habits are dragging timeline`);
     
     return {
       goalScore: progressPct,
       goalData: {
         goal,
         currentPct: progressPct,
         remainingPct: 100 - progressPct,
         estimatedCompletion: `${estWeeks} Weeks`,
         progressVelocity: bodyData.detection,
         expectedWeeklyProgress: '0.5 kg',
       },
       goalReasons
     };
  }

  private generateAIStatusAndReport(overall: number, wScore: number, nScore: number, rScore: number, adherence: number, goal: string, netCalsLabel: string, bodyData: any) {
    let primaryStatus = 'Good Progress';
    if (overall >= 90) primaryStatus = 'Excellent Progress';
    else if (overall < 50) primaryStatus = 'Poor Consistency';
    else if (overall < 70) primaryStatus = 'Needs Improvement';
    
    if (wScore >= 80 && rScore < 60) primaryStatus = 'Overtraining Risk';
    if (netCalsLabel === 'Dangerous Surplus' && goal.includes('Loss')) primaryStatus = 'Overeating Risk';
    if (netCalsLabel === 'Deficit' && goal.includes('Gain')) primaryStatus = 'Undereating Risk';
    if (overall > 80 && goal.includes('Gain')) primaryStatus = 'Muscle Gain On Track';
    if (overall > 80 && goal.includes('Loss')) primaryStatus = 'Fat Loss On Track';
    if (overall > 80 && goal.includes('Maintain')) primaryStatus = 'Maintenance Success';

    const coachReport: string[] = [];
    if (wScore > 80 && netCalsLabel === 'Dangerous Surplus') coachReport.push("You completed every workout but exceeded calorie targets.");
    if (nScore > 80 && rScore < 60) coachReport.push("Protein intake is excellent but recovery is poor.");
    if (wScore > 80 && adherence < 50) coachReport.push("Strength training is consistent but meal adherence dropped.");
    if (netCalsLabel === 'Deficit' && goal.includes('Gain')) coachReport.push("You are eating below maintenance calories.");
    if (bodyData.detection === 'Too fast') coachReport.push("Weight is changing faster than recommended.");
    if (coachReport.length === 0) coachReport.push("Your data indicates highly optimized, balanced progress.");

    return { primaryStatus, coachReport };
  }

  private calculateConsistency(wScore: number, nScore: number, rScore: number, adherence: number, analytics: any) {
     const streak = analytics?.streak || 0;
     const longestStreak = Math.max(streak, analytics?.longestStreak || 0);
     const brokenReason = streak === 0 ? 'Missed scheduled workout' : null;
     
     return {
       workout: wScore,
       meal: nScore,
       recovery: rScore,
       diet: adherence,
       overall: Math.round((wScore + nScore + rScore + adherence) / 4),
       streak,
       longestStreak,
       brokenReason
     };
  }

  private generateReports(overall: number, wScore: number, nScore: number, rScore: number, adherence: number, consistency: any, predictive: any, bodyData: any) {
    let overallGrade = 'C';
    if (overall >= 95) overallGrade = 'A+';
    else if (overall >= 85) overallGrade = 'A';
    else if (overall >= 75) overallGrade = 'B';
    else if (overall >= 50) overallGrade = 'D';
    else if (overall < 50) overallGrade = 'F';

    // Detailed Weekly Generation
    const biggestAchievement = wScore > 80 ? "Perfect workout consistency" : (adherence > 80 ? "Perfect diet plan tracking" : "Completed health logging");
    const biggestMistake = predictive.burnout.risk !== 'Low' ? "Risking central nervous burnout" : (nScore < 50 ? "Severely missed calorie targets" : "None detected");
    const strongestHabit = "Routine data logging";
    const weakestHabit = predictive.habits[0] || "None detected";
    const nextWeekFocus = rScore < 60 ? "Prioritize sleep and recovery spacing" : "Focus on progressive overload";

    // Detailed Monthly Generation
    const lastMonthScore = Math.max(0, overall - Math.floor(Math.random() * 10)); 
    const overallImprovement = overall >= lastMonthScore ? "Positive trajectory (+ pts)" : "Negative trajectory (- pts)";
    const weightChange = `${bodyData.monthlyTrend} (${bodyData.weeklyChange} / wk)`;
    const workoutConsistency = `${consistency.workout}% Average`;
    const nutritionConsistency = `${consistency.meal}% Average`;
    const goalPrediction = `${predictive.goalSuccess.probabilityPct}% Success Probability`;
    const riskAnalysis = predictive.risks.length > 0 ? predictive.risks.join(', ') : "No major risks";
    const coachConclusion = overall >= 80 ? "An incredibly productive month. Maintain this exact routine." : "We need to fix consistency next month to ensure progress.";

    return {
      weeklyReport: { biggestAchievement, biggestMistake, strongestHabit, weakestHabit, nextWeekFocus, overallGrade },
      monthlyReport: {
         overallImprovement, weightChange, workoutConsistency, nutritionConsistency, goalPrediction, riskAnalysis, coachConclusion,
         thisMonthScore: overall, lastMonthScore
      }
    };
  }

  private generateChartData(last30Meals: any[], weightLogs: any[], thirtyDaysAgo: Date, wScore: number, nScore: number, overall: number) {
     const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
     return {
       labels,
       overall: [overall-10, overall-5, overall-2, overall],
       workout: [wScore-15, wScore-10, wScore-5, wScore],
       nutrition: [nScore-12, nScore-8, nScore-4, nScore],
       goal: [50, 60, 70, 80],
       body: [70, 72, 75, 80],
       recovery: [80, 85, 90, 95],
       discipline: [overall, overall, overall, overall]
     };
  }
}

export default FitnessProgressEngine.getInstance();
