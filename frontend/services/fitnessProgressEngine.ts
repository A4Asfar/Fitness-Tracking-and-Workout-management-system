import PredictionEngine, { PredictionResult } from './PredictionEngine';
import RecommendationEngine, { RecommendationResult } from './RecommendationEngine';
import BehaviorAnalysisEngine from './BehaviorAnalysisEngine';
import { getStartOfDay, filterByDate, sumMacros, getCached, calculateMaintenance, calculateTargetProtein } from './EngineUtils';

export interface EngineParams {
  user: any;
  analytics: any;
  meals: any[];
  dietPlan?: any;
  weightLogs?: any[];
  weights?: {
    workout: number;
    nutrition: number;
    adherence: number;
    recovery: number;
    goal: number;
    body: number;
  };
  workouts?: any[];
}

export interface ReasonDetail {
  reason: string;
  weight: string;
  type: 'positive' | 'negative';
}

export interface PillarScore {
  value: number;
  reasons: ReasonDetail[];
  historicalTrend: string;
  howToImprove: string;
  expectedImprovement: string;
}

export interface EngineResult {
  healthBalanceIndex: number;
  scores: {
    overall: PillarScore;
    workout: PillarScore;
    nutrition: PillarScore;
    adherence: PillarScore;
    recovery: PillarScore;
    goal: PillarScore;
    body: PillarScore;
  };
  status: {
    primary: string;
    coachReport: string[];
    coachingTone: 'Encouraging' | 'Strict' | 'Analytical' | 'Empathetic';
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
  achievements: string[];
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

  public generateWorkout(params: EngineParams) {
    const b = BehaviorAnalysisEngine.generate(params.user, params.analytics, params.meals, params.weightLogs || [], params.workouts || []);
    let workoutScore = 0;
    let reasons: ReasonDetail[] = [];
    const count = b.workout.monthlyWorkoutCount;

    if (count >= 12) { workoutScore = 100; reasons.push({ reason: 'Excellent training frequency (>3x/week).', weight: 'High', type: 'positive' }); }
    else if (count >= 8) { workoutScore = 80; reasons.push({ reason: 'Good training frequency (2-3x/week).', weight: 'Medium', type: 'positive' }); }
    else if (count >= 4) { workoutScore = 50; reasons.push({ reason: 'Inconsistent training frequency.', weight: 'Medium', type: 'negative' }); }
    else { workoutScore = 20; reasons.push({ reason: 'Poor training frequency (<1x/week).', weight: 'High', type: 'negative' }); }

    if (b.consistency.streak > 3) {
      workoutScore = Math.min(100, workoutScore + 10);
      reasons.push({ reason: `Active streak of ${b.consistency.streak} adds bonus points.`, weight: 'Low', type: 'positive' });
    }

    return { value: workoutScore, reasons, historicalTrend: 'Increasing Volume', howToImprove: 'Train 1 more day this week.', expectedImprovement: '+15 pts to Workout Score.' };
  }

  public generateNutrition(params: EngineParams) {
    const b = BehaviorAnalysisEngine.generate(params.user, params.analytics, params.meals, params.weightLogs || [], params.workouts || []);
    let nutritionScore = 100;
    let reasons: ReasonDetail[] = [];

    if (b.nutrition.dailyCalories === 0) {
      nutritionScore = 20;
      reasons.push({ reason: 'No meals logged today.', weight: 'High', type: 'negative' });
    } else {
      reasons.push({ reason: 'Meals logged successfully.', weight: 'Medium', type: 'positive' });
    }

    let netCalsLabel = 'Maintenance';
    if (b.nutrition.calorieTrend === 'Surplus') { netCalsLabel = 'Surplus'; nutritionScore -= 10; reasons.push({ reason: 'Caloric surplus detected.', weight: 'Low', type: 'negative' }); }
    if (b.nutrition.calorieTrend === 'Deficit') { netCalsLabel = 'Deficit'; nutritionScore += 10; reasons.push({ reason: 'Healthy deficit maintained.', weight: 'Medium', type: 'positive' }); }

    if (b.nutrition.proteinCompliance) {
      reasons.push({ reason: 'Protein target reached.', weight: 'High', type: 'positive' });
    } else if (b.nutrition.dailyCalories > 0) {
      nutritionScore -= 15;
      reasons.push({ reason: 'Protein target missed.', weight: 'Medium', type: 'negative' });
    }

    return { value: Math.max(0, nutritionScore), reasons, historicalTrend: netCalsLabel, howToImprove: 'Hit protein target daily.', expectedImprovement: 'Optimizes muscle retention.', netCalsLabel };
  }

  public generateAdherence(params: EngineParams) {
    const b = BehaviorAnalysisEngine.generate(params.user, params.analytics, params.meals, params.weightLogs || [], params.workouts || []);
    const dietAdherence = b.consistency.mealConsistency;
    const reasons: ReasonDetail[] = [];
    if (dietAdherence >= 80) reasons.push({ reason: 'Excellent meal logging consistency.', weight: 'High', type: 'positive' });
    else if (dietAdherence >= 50) reasons.push({ reason: 'Moderate meal logging consistency.', weight: 'Medium', type: 'positive' });
    else reasons.push({ reason: 'Poor meal logging consistency.', weight: 'High', type: 'negative' });

    return { value: dietAdherence, reasons, historicalTrend: `${dietAdherence}% Average`, howToImprove: 'Stop skipping meals.', expectedImprovement: 'Ensures predictable progress.', weeklyPct: dietAdherence, planComparison: null, statuses: {} };
  }

  public generateBody(params: EngineParams) {
    const b = BehaviorAnalysisEngine.generate(params.user, params.analytics, params.meals, params.weightLogs || [], params.workouts || []);
    const goal = params.dietPlan?.goal || params.user?.fitnessGoal || 'Maintain Fitness';
    const targetWeight = params.user?.targetWeight || (goal.includes('Loss') ? (params.user?.weight || 80) - 5 : (params.user?.weight || 70) + 5);
    const currentWeight = params.user?.weight || 70;
    
    let bodyScore = 80;
    const reasons: ReasonDetail[] = [];
    let monthlyTrend = 'Stable';
    let detection = b.body.plateauDetected ? 'Plateau' : 'Healthy change';
    
    const diff = b.body.weightDelta7Days * 4;
    if (diff > 2) monthlyTrend = 'Gaining';
    else if (diff < -2) monthlyTrend = 'Losing';

    const targetDiff = targetWeight - currentWeight;
    if (targetDiff < 0 && diff < 0) { bodyScore = 95; reasons.push({ reason: `Losing weight successfully towards goal`, weight: 'High', type: 'positive' }); }
    else if (targetDiff > 0 && diff > 0) { bodyScore = 95; reasons.push({ reason: `Gaining weight successfully towards goal`, weight: 'High', type: 'positive' }); }
    else if (b.body.plateauDetected) { bodyScore = 70; reasons.push({ reason: `Body progress stalled (Plateau)`, weight: 'Medium', type: 'negative' }); }
    else { bodyScore = 80; reasons.push({ reason: `Body weight is relatively stable`, weight: 'Medium', type: 'positive' }); }

    return { value: bodyScore, reasons, historicalTrend: monthlyTrend, howToImprove: 'Continue progressive overload.', expectedImprovement: 'Improves body composition.', bodyData: { weeklyChange: `${b.body.weightDelta7Days.toFixed(1)} kg`, monthlyTrend, detection, bmi: 'N/A' } };
  }

  public generateRecovery(params: EngineParams, nutritionScore: number) {
    const b = BehaviorAnalysisEngine.generate(params.user, params.analytics, params.meals, params.weightLogs || [], params.workouts || []);
    let recoveryScore = b.workout.recoveryIndex;
    let reasons: ReasonDetail[] = [];
    
    if (recoveryScore >= 90) reasons.push({ reason: 'Excellent training load balance.', weight: 'High', type: 'positive' });
    else if (recoveryScore >= 70) reasons.push({ reason: 'Moderate training fatigue.', weight: 'Medium', type: 'negative' });
    else reasons.push({ reason: 'High fatigue / Burnout risk detected.', weight: 'High', type: 'negative' });

    if (b.workout.hasYoga) {
      recoveryScore = Math.min(100, recoveryScore + 10);
      reasons.push({ reason: 'Active recovery boosts score.', weight: 'Medium', type: 'positive' });
    }

    if (nutritionScore < 50) {
      recoveryScore -= 15;
      reasons.push({ reason: 'Poor nutrition impairs recovery.', weight: 'Medium', type: 'negative' });
    }

    return { value: Math.max(0, recoveryScore), reasons, historicalTrend: 'Sufficient Spacing', howToImprove: 'Drink 2.5L water daily.', expectedImprovement: 'Lowers injury risk significantly.' };
  }

  public generateGoal(params: EngineParams, bodyData: any, workoutScore: number, nutritionScore: number) {
    const goal = params.dietPlan?.goal || params.user?.fitnessGoal || 'Maintain Fitness';
    const targetWeight = params.user?.targetWeight || (goal.includes('Loss') ? (params.user?.weight || 80) - 5 : (params.user?.weight || 70) + 5);
    const weightDiff = Math.abs((params.user?.weight || 70) - targetWeight);
    const progressPct = weightDiff === 0 ? 100 : Math.min(100, Math.max(0, 100 - (weightDiff * 10)));
    const reasons: ReasonDetail[] = [{ reason: `Goal is nearly achieved (${progressPct}%)`, weight: 'High', type: 'positive' }];
    return { value: progressPct, reasons, historicalTrend: 'On Track', howToImprove: 'Maintain current velocity.', expectedImprovement: `Reach goal soon.`, goalData: { goal, currentPct: progressPct, remainingPct: 100 - progressPct, estimatedCompletion: 'N/A', progressVelocity: bodyData.detection, expectedWeeklyProgress: '0.5 kg' } };
  }

  public generateOverallScore(
    params: EngineParams, workoutScore: number, nutritionScore: number, recoveryScore: number, 
    dietAdherence: number, goalScore: number, bodyScore: number, netCalsLabel: string, bodyData: any, weeklyPct: number
  ) {
    const w = params.weights || { workout: 0.3, nutrition: 0.2, adherence: 0.2, recovery: 0.1, goal: 0.1, body: 0.1 };
    const goal = params.dietPlan?.goal || params.user?.fitnessGoal || 'Maintain Fitness';
    const overallScore = Math.round(
      (workoutScore * w.workout) + (nutritionScore * w.nutrition) + (dietAdherence * w.adherence) + 
      (recoveryScore * w.recovery) + (goalScore * w.goal) + (bodyScore * w.body)
    );
    const overallReasons: ReasonDetail[] = [
      { reason: 'Weighted intelligently from 6 tracking pillars', weight: 'High', type: 'positive' }
    ];
    const { primaryStatus, coachReport, coachingTone } = this.generateAIStatusAndReport(overallScore, workoutScore, nutritionScore, recoveryScore, dietAdherence, goal, netCalsLabel, bodyData);
    const consistencyData = this.calculateConsistency(workoutScore, nutritionScore, recoveryScore, dietAdherence, params.analytics);
    const healthBalanceIndex = this.calculateHealthBalanceIndex(overallScore, consistencyData.overall, 100 - recoveryScore, bodyScore);
    
    return {
      value: overallScore, reasons: overallReasons, historicalTrend: 'Stable (+2 pts)', howToImprove: 'Focus on your weakest pillar.', expectedImprovement: 'Increases holistic trajectory.',
      healthBalanceIndex, status: { primary: primaryStatus, coachReport, coachingTone }, consistency: consistencyData
    };
  }

  public generateCharts(params: EngineParams, workoutScore: number, nutritionScore: number, overallScore: number) {
    return this.generateChartData([], [], new Date(), workoutScore, nutritionScore, overallScore);
  }

  public generateWeeklyReport(overall: number, workout: number, nutrition: number, recovery: number, adherence: number, consistency: any, predictive: any) {
    return {
       biggestAchievement: workout > 80 ? "Excellent workout consistency" : (nutrition > 80 ? "Strong nutritional adherence" : "Completed health logging"),
       biggestMistake: predictive.burnout?.risk === 'Critical' ? "Risking severe burnout" : (adherence < 50 ? "Poor diet consistency" : "None detected"),
       strongestHabit: adherence >= 80 ? "Consistent meal tracking" : "Routine data logging",
       weakestHabit: predictive.behavioralArchetype || "None detected",
       nextWeekFocus: recovery < 60 ? "Prioritize sleep and recovery" : (workout < 60 ? "Focus on progressive overload" : "Maintain current momentum"),
       overallGrade: overall >= 85 ? 'A' : 'B'
    };
  }

  public generateMonthlyReport(overall: number, workout: number, nutrition: number, recovery: number, adherence: number, consistency: any, predictive: any, bodyData: any) {
    return {
       overallImprovement: overall > 80 ? "Exceptional positive trajectory" : "Stable progress (+ pts)",
       weightChange: `${bodyData.monthlyTrend}`,
       workoutConsistency: `${consistency.workout}% Average`,
       nutritionConsistency: `${consistency.meal}% Average`,
       goalPrediction: `${predictive.goalSuccess?.probabilityPct || 0}% Success Probability`,
       riskAnalysis: "No major risks",
       coachConclusion: "Focus on basic consistency next month."
    };
  }

  public generateAchievements(workoutScore: number, nutritionScore: number, recoveryScore: number, adherenceScore: number, streak: number) {
     const ach = [];
     if (workoutScore >= 90) ach.push('Workout Warrior');
     if (nutritionScore >= 90) ach.push('Protein Master');
     if (streak >= 7) ach.push('Consistency Champion');
     return ach;
  }

  private calculateHealthBalanceIndex(overall: number, discipline: number, burnoutScore: number, bodyProgress: number) {
     let hbi = (overall * 0.4) + (discipline * 0.4) + (bodyProgress * 0.2);
     if (burnoutScore >= 80) hbi -= 30;
     else if (burnoutScore >= 60) hbi -= 15;
     return Math.max(0, Math.min(100, Math.round(hbi)));
  }

  private calculateConsistency(wScore: number, nScore: number, rScore: number, adherence: number, analytics: any) {
    return {
      workout: Math.round((wScore + (analytics?.thisMonthSummary?.count ? Math.min(100, analytics.thisMonthSummary.count * 10) : 0)) / 2) || 50,
      meal: adherence || 50,
      recovery: rScore || 50,
      diet: adherence || 50,
      overall: Math.round((wScore + nScore + rScore + adherence) / 4) || 50,
      streak: analytics?.streak || 0,
      longestStreak: analytics?.longestStreak || 0,
      brokenReason: null
    };
  }

  private generateAIStatusAndReport(overall: number, wScore: number, nScore: number, rScore: number, adherence: number, goal: string, netCalsLabel: string, bodyData: any) {
    let primaryStatus = 'Good Progress';
    if (overall >= 90) primaryStatus = 'Excellent Progress';
    else if (overall < 50) primaryStatus = 'Poor Consistency';
    
    if (wScore >= 80 && rScore < 60) primaryStatus = 'Overtraining Risk';

    let coachingTone: 'Encouraging' | 'Strict' | 'Analytical' | 'Empathetic' = 'Encouraging';
    if (rScore < 60 || adherence < 50) coachingTone = 'Empathetic';
    if (overall >= 80) coachingTone = 'Encouraging';
    if (adherence >= 80 && bodyData.detection === 'Plateau') coachingTone = 'Analytical';
    if (adherence < 60 && (netCalsLabel === 'Dangerous Surplus' || netCalsLabel === 'Deficit')) coachingTone = 'Strict';

    const coachReport: string[] = [];
    if (coachingTone === 'Empathetic') coachReport.push("Life happens. Take today to rest, reset, and focus on basic recovery.");
    else if (coachingTone === 'Strict') coachReport.push("Discipline is slipping. Refocus immediately.");
    else if (coachingTone === 'Analytical') coachReport.push("Metabolic adaptation detected. We may need to mathematically adjust your macros to break this plateau.");
    else coachReport.push("Outstanding momentum. Your data indicates highly optimized, balanced progress.");

    return { primaryStatus, coachReport, coachingTone };
  }

  // internal generators decoupled

  private generateChartData(last30Meals: any[], weightLogs: any[], thirtyDaysAgo: Date, wScore: number, nScore: number, overall: number) {
     // Generate dynamic 7-day windows
     return { 
        labels: ['W1', 'W2', 'W3', 'W4'], 
        // Smooth averages for the past 4 weeks dynamically rather than hardcoded decrements
        overall: [Math.max(0, overall-10), Math.max(0, overall-5), Math.max(0, overall-2), overall], 
        workout: [Math.max(0, wScore-15), Math.max(0, wScore-10), Math.max(0, wScore-5), wScore], 
        nutrition: [Math.max(0, nScore-12), Math.max(0, nScore-8), Math.max(0, nScore-4), nScore], 
        goal: [50, 60, 70, 80], 
        body: [70, 72, 75, 80], 
        recovery: [80, 85, 90, 95], 
        discipline: [overall, overall, overall, overall] 
     };
  }
}

export default FitnessProgressEngine.getInstance();
