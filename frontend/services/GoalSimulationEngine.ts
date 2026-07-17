export interface SimulationResult {
  estimatedCompletionDays: number | string;
  muscleGainPotential: string;
  fatLossPotential: string;
  metabolicRisk: string;
}

class GoalSimulationEngine {
  private static instance: GoalSimulationEngine;
  private constructor() {}

  public static getInstance(): GoalSimulationEngine {
    if (!GoalSimulationEngine.instance) {
      GoalSimulationEngine.instance = new GoalSimulationEngine();
    }
    return GoalSimulationEngine.instance;
  }

  public simulate(
    userWeight: number,
    targetWeight: number,
    goal: string,
    trainingDaysPerWeek: number,
    dailyCalories: number,
    dailyProtein: number,
    maintenanceCalories: number
  ): SimulationResult {
    const weightDiff = Math.abs(userWeight - targetWeight);
    if (weightDiff === 0) {
       return {
          estimatedCompletionDays: 'Goal Reached',
          muscleGainPotential: 'Optimized for Maintenance',
          fatLossPotential: 'Minimal',
          metabolicRisk: 'None'
       };
    }

    const netCalories = dailyCalories - maintenanceCalories;
    // Base rule: 7700 kcal deficit = 1kg fat loss
    
    let weeklyWeightChange = (netCalories * 7) / 7700; 
    let muscleGainPotential = 'Low';
    let fatLossPotential = 'Low';
    let metabolicRisk = 'Low';

    if (netCalories < -1000) metabolicRisk = 'Critical (Muscle Loss & Hormonal Crash)';
    else if (netCalories < -500) metabolicRisk = 'Moderate (Adaptation Risk)';
    
    if (netCalories > 1000) metabolicRisk = 'High (Rapid Fat Gain)';

    if (netCalories < 0) {
       fatLossPotential = netCalories <= -500 ? 'High' : 'Moderate';
       muscleGainPotential = trainingDaysPerWeek >= 4 && dailyProtein >= (userWeight * 2) ? 'Moderate (Recomp)' : 'Low';
       // We only consider weight dropping if goal is Loss
       if (!goal.toLowerCase().includes('loss')) weeklyWeightChange = 0; // Invalid simulation state
    } else if (netCalories > 0) {
       fatLossPotential = 'None';
       muscleGainPotential = trainingDaysPerWeek >= 4 && dailyProtein >= (userWeight * 1.8) ? 'High' : 'Low';
       if (!goal.toLowerCase().includes('gain')) weeklyWeightChange = 0;
    } else {
       fatLossPotential = 'Slow';
       muscleGainPotential = trainingDaysPerWeek >= 3 ? 'Moderate' : 'Low';
       weeklyWeightChange = 0.1 * Math.sign(targetWeight - userWeight); // Very slow recomposition
    }

    weeklyWeightChange = Math.abs(weeklyWeightChange);
    let estimatedCompletionDays: number | string = 'Unrealistic / Infinite';

    if (weeklyWeightChange > 0.05) {
       const weeksRequired = weightDiff / weeklyWeightChange;
       estimatedCompletionDays = Math.ceil(weeksRequired * 7);
    }

    // Add extra efficiency for high protein + training volume
    if (typeof estimatedCompletionDays === 'number' && trainingDaysPerWeek >= 4 && dailyProtein >= userWeight * 2) {
       estimatedCompletionDays = Math.max(7, Math.floor(estimatedCompletionDays * 0.9)); 
    }

    return {
       estimatedCompletionDays,
       muscleGainPotential,
       fatLossPotential,
       metabolicRisk
    };
  }
}

export default GoalSimulationEngine.getInstance();
