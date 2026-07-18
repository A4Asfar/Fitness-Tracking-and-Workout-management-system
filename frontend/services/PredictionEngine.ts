import { getStartOfDay, filterByDate, getCached } from './EngineUtils';

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

    const today = getStartOfDay();
    
    const recentMeals = filterByDate(meals, 29);
    const recentWeights = filterByDate(weightLogs, 29).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const plateau = this.detectPlateau(recentWeights, today);
    const predictions = this.predictFuture(user, recentWeights, recentMeals, analytics);
    const burnout = this.detectBurnout(analytics, recentMeals, workouts);
    const habits = this.analyzeHabits(recentMeals, analytics);
    const goalSuccess = this.predictGoalSuccess(user, plateau, predictions, analytics, workouts);
    const timeline = this.generateTimeline(recentMeals, analytics, today, workouts);
    const risks = this.detectRisks(plateau, burnout, recentMeals, user);
    const personalBests = this.calculatePersonalBests(analytics, recentMeals, workouts);
    const milestones = this.calculateMilestones(analytics, recentMeals, user, recentWeights, workouts);

    return { predictions, plateau, burnout, habits, goalSuccess, timeline, risks, personalBests, milestones };
  }

  private detectPlateau(weights: any[], today: Date) {
    return getCached(weights, 'detectPlateau', () => {
      if (weights.length < 3) return { isPlateaued: false, duration: 0, message: '', recommendation: null };
      
      let sum7 = 0, count7 = 0;
      let sum14 = 0, count14 = 0;
      let sum30 = 0, count30 = 0;

      const newest = weights[weights.length - 1];
      
      weights.forEach(w => {
         const daysDiff = (new Date(today).getTime() - new Date(w.date).getTime()) / (1000 * 3600 * 24);
         if (daysDiff <= 7) { sum7 += w.weight; count7++; }
         if (daysDiff <= 14) { sum14 += w.weight; count14++; }
         if (daysDiff <= 30) { sum30 += w.weight; count30++; }
      });

      const avg7 = count7 > 0 ? sum7 / count7 : newest.weight;
      const avg14 = count14 > 0 ? sum14 / count14 : avg7;
      const avg30 = count30 > 0 ? sum30 / count30 : avg14;

      const diff7_14 = Math.abs(avg7 - avg14);
      const diff14_30 = Math.abs(avg14 - avg30);

      let plateauDuration = 0;
      if (diff14_30 < 0.5 && count30 >= 10) plateauDuration = 30;
      else if (diff7_14 < 0.3 && count14 >= 5) plateauDuration = 14;
      else if (Math.abs(newest.weight - avg7) < 0.2 && count7 >= 3) plateauDuration = 7;

      if (plateauDuration >= 7) {
         return {
            isPlateaued: true,
            duration: plateauDuration,
            message: `Weight is plateauing based on a ${plateauDuration}-day moving average.`,
            recommendation: plateauDuration >= 14 ? 'Recalculate your caloric needs and add a 200 kcal deficit.' : 'Stay consistent, temporary stalls are normal.'
         };
      }
      return { isPlateaued: false, duration: 0, message: '', recommendation: null };
    });
  }

  private predictFuture(user: any, weights: any[], meals: any[], analytics: any) {
    return getCached(meals, 'predictFuture', () => {
       const currentWeight = user?.weight || 70;
       let dailyDelta = 0;
       if (weights.length >= 2) {
          const oldest = weights[0];
          const newest = weights[weights.length - 1];
          const days = Math.max(1, (new Date(newest.date).getTime() - new Date(oldest.date).getTime()) / (1000*3600*24));
          dailyDelta = (newest.weight - oldest.weight) / days;
       }

       const weight7Days = +(currentWeight + (dailyDelta * 7)).toFixed(1);
       const weight30Days = +(currentWeight + (dailyDelta * 30)).toFixed(1);

       // Avg caloric state
       let totalCals = 0;
       meals.forEach(m => totalCals += (m.calories || 0));
       const avgCals = meals.length ? (totalCals / 30) : 2000;
       const maintenance = user?.weight ? user.weight * 24 * 1.2 : 2500;
       
       let caloricTrend = 'Maintenance';
       if (avgCals < maintenance - 300) caloricTrend = 'Deficit';
       else if (avgCals > maintenance + 300) caloricTrend = 'Surplus';

       let bodyCompositionTrend = 'Maintaining';
       const avgProtein = meals.reduce((a,b)=>a+(b.protein||0),0) / 30;
       const targetPro = currentWeight * 1.8;
       const trainingVolume = analytics?.thisMonthSummary?.count || 0;

       if (trainingVolume > 12 && avgProtein >= targetPro) bodyCompositionTrend = caloricTrend === 'Deficit' ? 'Losing Fat, Retaining Muscle' : 'Gaining Muscle';
       else if (caloricTrend === 'Deficit') bodyCompositionTrend = 'Losing Weight (Fat & Muscle)';
       else if (caloricTrend === 'Surplus') bodyCompositionTrend = 'Gaining Fat';

       return { weight7Days, weight30Days, caloricTrend, bodyCompositionTrend };
    });
  }

  private detectBurnout(analytics: any, meals: any[], workouts: any[]) {
    return getCached(workouts, 'detectBurnout', () => {
       const today = new Date();
       today.setHours(0,0,0,0);
       
       let consecutiveDays = 0;
       for (let i = 0; i < 14; i++) {
          const check = new Date(today);
          check.setDate(check.getDate() - i);
          const hasWorkout = workouts.some(w => {
             const wd = new Date(w.date);
             wd.setHours(0,0,0,0);
             return wd.getTime() === check.getTime();
          });
          if (hasWorkout) consecutiveDays++;
          else break;
       }

       const recentWorkouts = workouts.filter(w => (today.getTime() - new Date(w.date).getTime()) <= 7 * 24 * 3600 * 1000);
       const workoutCount7d = recentWorkouts.length;
       const restDays = 7 - workoutCount7d;

       let score = 0;
       if (consecutiveDays >= 5) score += 30;
       if (consecutiveDays >= 7) score += 20;
       if (restDays === 0) score += 25;

       const avgCals = meals.reduce((a,b)=>a+(b.calories||0),0) / 30;
       if (avgCals > 0 && avgCals < 1500) score += 25;

       let risk: 'Low'|'Medium'|'High'|'Critical' = 'Low';
       let rec = null;
       if (score >= 70) { 
          risk = 'Critical'; 
          rec = `Critical Risk: ${consecutiveDays} consecutive training days with ${restDays} rest days. Mandatory rest day required.`; 
       } else if (score >= 40) { 
          risk = 'High'; 
          rec = `High Risk: ${workoutCount7d} workouts this week. Recommend a deload or recovery day soon.`; 
       } else if (score >= 20) { 
          risk = 'Medium'; 
          rec = `Moderate training load detected. Ensure adequate sleep.`; 
       }

       return { risk, score, recommendation: rec };
    });
  }

  private analyzeHabits(meals: any[], analytics: any) {
    return getCached(meals, 'analyzeHabits', () => {
       const habits = [];
       
       // Detect skipped breakfasts
       let breakfastCount = 0;
       meals.forEach(m => {
          if ((m.mealType || m.category) === 'Breakfast') breakfastCount++;
       });
       if (meals.length > 0 && breakfastCount < 10) habits.push("Frequently skipping breakfast");

       // Detect weekend behavior (Mocks for algorithm depth)
       // Normally we would parse dates to see if weekends have high calories
       const streak = analytics?.streak || 0;
       if (streak === 0 && (analytics?.thisMonthSummary?.count || 0) > 4) habits.push("Inconsistent training schedule (breaking streaks)");

       if (habits.length === 0) habits.push("Consistent daily tracking routine");

       return habits;
    });
  }

  private predictGoalSuccess(user: any, plateau: any, predictions: any, analytics: any, workouts: any[]) {
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
     
     if (isLossGoal && rate < 0) {
        prob += 20;
        confidence = 'Medium';
     } else if (!isLossGoal && rate > 0) {
        prob += 20;
        confidence = 'Medium';
     } else if (Math.abs(rate) < 0.1) {
        prob -= 10;
     }

     const recentWorkouts = workouts.filter(w => (new Date().getTime() - new Date(w.date).getTime()) <= 30 * 24 * 3600 * 1000);
     if (recentWorkouts.length >= 12) { prob += 20; confidence = 'High'; }
     if (plateau.isPlateaued) prob -= 15;
     
     prob = Math.max(0, Math.min(100, prob));

     let estFinish = 'Timeline at risk';
     if (prob >= 40 && Math.abs(rate) > 0.01) {
        const weeks = Math.ceil(Math.abs(diff) / Math.abs(rate));
        estFinish = weeks > 52 ? '> 1 Year' : `${weeks} Weeks`;
     }
     if (Math.abs(diff) < 0.5) estFinish = 'Goal Reached';

     return { probabilityPct: prob, confidence, estimatedFinish: estFinish };
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
             const wCals = dayWorkouts.reduce((a, b) => a + Math.round((b.duration || 30) * 8.5), 0);
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
     const risks = [];
     if (burnout.risk === 'Critical' || burnout.risk === 'High') risks.push('Overtraining Risk');
     
     let totalCals = 0;
     meals.slice(-7).forEach(m => totalCals += (m.calories || 0));
     const avgCals = meals.slice(-7).length ? totalCals / 7 : 0;
     if (avgCals > 0 && avgCals < 1200) risks.push('Severe Undereating Detected');
     if (avgCals > 3500) risks.push('Severe Overeating Detected');

     if (plateau.duration >= 30) risks.push('Metabolic Adaptation Plateau');

     return risks;
  }

  private calculatePersonalBests(analytics: any, meals: any[], workouts: any[]) {
    return getCached(workouts, 'calculatePersonalBests', () => {
       let mostCals = 0;
       workouts.forEach(w => {
          const cals = Math.round((w.duration || 30) * 8.5);
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
       const totalDaysActive = Math.max(1, Math.floor((new Date().getTime() - new Date(workouts[workouts.length-1]?.date || new Date()).getTime()) / (1000 * 3600 * 24)));
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
