import { getStartOfDay, filterByDate, getCached, calculateMaintenance, calculateTargetProtein, sumWorkoutVolume } from './EngineUtils';
import BehaviorAnalysisEngine from './BehaviorAnalysisEngine';
import EngineDiagnostics from './EngineDiagnostics';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface PredictionResult {
  predictions: {
    weight7Days: number;
    weight30Days: number;
    caloricTrend: string;
    bodyCompositionTrend: string;
  };
  plateau: {
    isPlateaued: boolean;
    duration: number;
    message: string;
    recommendation: string | null;
  };
  burnout: {
    risk: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendation: string | null;
    score: number;
  };
  habits: string[];
  behavioralArchetype: string;
  goalSuccess: {
    probabilityPct: number;
    confidence: 'High' | 'Medium' | 'Low';
    estimatedFinish: string;
  };
  timeline: { day: string; insight: string; date: string }[];
  risks: string[];
  personalBests: {
    longestStreak: number;
    mostCaloriesBurned: number;
    bestWorkoutWeek: number;
    bestAdherence: number;
  };
  milestones: string[];
  diagnostics?: any;
  confidenceReasons?: string[];
}

class PredictionEngine {
  private static instance: PredictionEngine;
  private memoCache: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  public clearCache() {
    this.memoCache.clear();
  }

  public generate(user: any, analytics: any, meals: any[], weightLogs: any[], dietPlan: any, workouts: any[] = []): PredictionResult {
    this.clearCache();
    const startTime = Date.now();

    const today = getStartOfDay();
    const b = BehaviorAnalysisEngine.generate(user, analytics, meals, weightLogs, workouts);
    
    const recentMeals = filterByDate(meals, 29);
    const recentWeights = filterByDate(weightLogs, 29).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const plateau = {
       isPlateaued: b.body.plateauDetected,
       duration: b.body.plateauDuration,
       message: b.body.plateauDetected ? `Weight is plateauing based on a ${b.body.plateauDuration}-day moving average.` : '',
       recommendation: b.body.plateauDuration >= 14 ? 'Recalculate your caloric needs and add a 200 kcal deficit.' : 'Stay consistent, temporary stalls are normal.'
    };

    const currentWeight = user?.weight || 70;
    const predictions = {
       weight7Days: +(currentWeight + b.body.weightDelta7Days).toFixed(1),
       weight30Days: +(currentWeight + (b.body.weightDelta7Days / 7 * 30)).toFixed(1),
       caloricTrend: b.nutrition.calorieTrend,
       bodyCompositionTrend: b.nutrition.calorieTrend === 'Deficit' ? 'Losing Weight' : (b.nutrition.calorieTrend === 'Surplus' ? 'Gaining Weight' : 'Maintaining')
    };

    let risk: 'Low'|'Medium'|'High'|'Critical' = 'Low';
    let rec = null;
    if (b.workout.recoveryIndex <= 30) {
       risk = 'Critical';
       rec = `Critical Risk: Training load spiked (ACWR ${b.workout.ACWR.toFixed(2)}). Mandatory rest day required.`;
    } else if (b.workout.recoveryIndex <= 60 || b.workout.ACWR >= 1.5) {
       risk = 'High';
       rec = `High Risk: ACWR is ${b.workout.ACWR.toFixed(2)} (Danger Zone). Recommend a deload or recovery day soon.`;
    } else if (b.workout.ACWR >= 1.3) {
       risk = 'Medium';
       rec = `Moderate training load detected. Ensure adequate sleep.`;
    }
    const burnout = { risk, score: 100 - b.workout.recoveryIndex, recommendation: rec };

    const habits = b.behavior.habits;
    const behavioralArchetype = b.behavior.archetype;

    const goalSuccess = this.predictGoalSuccess(user, plateau, predictions, analytics, workouts, today, b);
    const timeline = this.generateTimeline(recentMeals, analytics, today, workouts);
    const risks = this.detectRisks(plateau, burnout, recentMeals, user);
    const personalBests = this.calculatePersonalBests(analytics, recentMeals, workouts, today);
    const milestones = this.calculateMilestones(analytics, recentMeals, user, recentWeights, workouts);

    const diagnostics = EngineDiagnostics.getSnapshot();
    EngineDiagnostics.recordExecutionTime('PredictionEngine', Date.now() - startTime);

    return { predictions, plateau, burnout, habits, behavioralArchetype, goalSuccess, timeline, risks, personalBests, milestones, diagnostics, confidenceReasons: goalSuccess.reasons };
  }

  // internal helpers that still rely on specific outputs

  private predictGoalSuccess(user: any, plateau: any, predictions: any, analytics: any, workouts: any[], today: Date, b: any) {
     const goal = user?.fitnessGoal || 'Weight Loss';
     const currentWeight = user?.weight || 70;
     const targetWeight = user?.targetWeight || 75;
     
     const diff = targetWeight - currentWeight;
     const isLossGoal = goal.includes('Loss') || targetWeight < currentWeight;
     
     // Evaluate rate of change
     const w7 = predictions.weight7Days;
     const rate = w7 - currentWeight; // rate per week roughly
     
     let prob = 50;
     let confidence: 'High'|'Medium'|'Low' = 'Low';
     const reasons: string[] = [];
     
     if (isLossGoal && rate < 0) {
        prob += 20;
        confidence = 'Medium';
     } else if (!isLossGoal && rate > 0) {
        prob += 20;
        confidence = 'Medium';
     } else if (Math.abs(rate) < 0.1) {
        prob -= 10;
     }

     const recentWorkouts = workouts.filter(w => (today.getTime() - new Date(w.date).getTime()) <= 30 * 24 * 3600 * 1000);
     if (recentWorkouts.length >= 12) { 
        prob += 20; 
        confidence = 'High'; 
        reasons.push(`✓ ${recentWorkouts.length} recent workout sessions logged`);
     } else {
        reasons.push(`⚠ Sparse workout data (only ${recentWorkouts.length} in last 30 days)`);
     }

     if (plateau.isPlateaued) {
        prob -= 15;
        reasons.push(`⚠ Active metabolic plateau detected (${plateau.duration} days)`);
     }

     if (b.consistency.mealConsistency > 70) {
        reasons.push(`✓ High meal logging consistency (${b.consistency.mealConsistency}%)`);
     } else {
        reasons.push(`⚠ Inconsistent nutrition tracking`);
     }
     
     prob = Math.max(0, Math.min(100, prob));

     let estFinish = 'Timeline at risk';
     if (prob >= 40 && Math.abs(rate) > 0.01) {
        const weeks = Math.ceil(Math.abs(diff) / Math.abs(rate));
        estFinish = weeks > 52 ? '> 1 Year' : `${weeks} Weeks`;
     }
     if (Math.abs(diff) < 0.5) estFinish = 'Goal Reached';

     return { probabilityPct: prob, confidence, estimatedFinish: estFinish, reasons };
  }

  private generateTimeline(meals: any[], analytics: any, today: Date, workouts: any[]) {
    return getCached(meals, 'generateTimeline', () => {
       const timeline = [];
       for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dayName = DAYS[d.getDay()];
          
          const dayMeals = meals.filter(m => {
             const md = new Date(m.selectedAt || m.createdAt || m.date);
             md.setHours(0,0,0,0);
             return md.getTime() === d.getTime();
          });

          const dayWorkouts = workouts.filter(w => {
             const wd = new Date(w.date);
             wd.setHours(0,0,0,0);
             return wd.getTime() === d.getTime();
          });
          
          let insight = '';
          const pro = dayMeals.reduce((a,b)=>a+(b.protein||0),0);
          const cals = dayMeals.reduce((a,b)=>a+(b.calories||0),0);
          
          if (dayWorkouts.length > 0) {
             const wCals = sumWorkoutVolume(dayWorkouts).cals;
             insight += `Workout completed (${wCals} kcal burned). `;
          } else {
             insight += `Rest day. `;
          }

          if (dayMeals.length > 0) {
             insight += `Logged ${dayMeals.length} meals (${cals} kcal, ${pro}g protein).`;
          } else {
             insight += `No meals logged.`;
          }

          timeline.push({ day: dayName, insight: insight.trim(), date: d.toISOString().split('T')[0] });
       }
       return timeline.reverse(); // Newest first
    });
  }

  private detectRisks(plateau: any, burnout: any, meals: any[], user: any) {
    return getCached(meals, 'detectRisks', () => {
       const risks = [];
       if (burnout.risk === 'Critical' || burnout.risk === 'High') risks.push('Overtraining Risk');
       
       const recentMeals = filterByDate(meals, 7);
       let totalCals = 0;
       recentMeals.forEach((m: any) => totalCals += (m.calories || 0));
       const avgCals = recentMeals.length ? totalCals / 7 : 0;
       if (avgCals > 0 && avgCals < 1200) risks.push('Severe Undereating Detected');
       if (avgCals > 3500) risks.push('Severe Overeating Detected');

       if (plateau.duration >= 30) risks.push('Metabolic Adaptation Plateau');

       return risks;
    });
  }

  private calculatePersonalBests(analytics: any, meals: any[], workouts: any[], today: Date) {
    return getCached(workouts, 'calculatePersonalBests', () => {
       let mostCals = 0;
       workouts.forEach(w => {
          const cals = sumWorkoutVolume([w]).cals;
          if (cals > mostCals) mostCals = cals;
       });

       // Best workout week
       let bestWeekCount = 0;
       const weekMap = new Map<string, number>();
       workouts.forEach(w => {
          const wd = new Date(w.date);
          const yearWeek = `${wd.getFullYear()}-${Math.floor(wd.getTime() / (1000 * 60 * 60 * 24 * 7))}`;
          weekMap.set(yearWeek, (weekMap.get(yearWeek) || 0) + 1);
       });
       weekMap.forEach(count => { if (count > bestWeekCount) bestWeekCount = count; });

       // Diet Adherence (days with meals / total days active)
       const uniqueMealDays = new Set(meals.map(m => new Date(m.selectedAt || m.createdAt || m.date).toISOString().split('T')[0])).size;
       const totalDaysActive = Math.max(1, Math.floor((today.getTime() - new Date(workouts[workouts.length-1]?.date || today).getTime()) / (1000 * 3600 * 24)));
       const adherence = Math.min(100, Math.round((uniqueMealDays / Math.max(1, Math.min(totalDaysActive, 30))) * 100));

       return {
          longestStreak: analytics?.longestStreak || 0,
          mostCaloriesBurned: mostCals,
          bestWorkoutWeek: bestWeekCount,
          bestAdherence: adherence
       };
    });
  }

  private calculateMilestones(analytics: any, meals: any[], user: any, weightLogs: any[], workouts: any[]) {
    return getCached(workouts, 'calculateMilestones', () => {
       const milestones = [];
       const totalW = workouts.length;
       if (totalW >= 7) milestones.push('7 Workouts Completed');
       if (totalW >= 30) milestones.push('30 Workouts Completed');
       if (totalW >= 100) milestones.push('100 Workouts Completed Century Club');
       
       const streak = analytics?.longestStreak || 0;
       if (streak >= 7) milestones.push('7 Day Streak');
       if (streak >= 30) milestones.push('30 Day Iron Streak');

       const uniqueMeals = new Set(meals.map(m => m.name)).size;
       if (uniqueMeals >= 10) milestones.push('Diverse Diet Achiever (10+ recipes)');

       const highProteinDays = meals.filter(m => (m.protein || 0) > 40).length;
       if (highProteinDays >= 20) milestones.push('Protein Master');

       return milestones;
    });
  }
}

export default PredictionEngine.getInstance();
