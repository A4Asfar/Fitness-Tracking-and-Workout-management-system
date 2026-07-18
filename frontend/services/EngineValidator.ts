import { FitnessRules } from './FitnessRules';
import EngineDiagnostics from './EngineDiagnostics';

export const EngineValidator = {
  sanitizeUser(user: any) {
    if (!user) {
      EngineDiagnostics.recordWarning('Missing user object. Defaulting to safe defaults.');
      return { weight: FitnessRules.DEFAULT_WEIGHT_KG, gender: 'male', fitnessGoal: 'Maintenance' };
    }
    return {
      ...user,
      weight: (user.weight && user.weight > 20 && user.weight < 400) ? user.weight : FitnessRules.DEFAULT_WEIGHT_KG,
    };
  },

  sanitizeMeals(meals: any[]) {
    if (!Array.isArray(meals)) return [];
    const sanitized = [];
    const seenMap = new Set<string>(); // avoid strict duplicates
    const now = Date.now();

    for (let i = 0; i < meals.length; i++) {
      const m = meals[i];
      if (!m) continue;
      
      const cals = m.calories || 0;
      const pro = m.protein || 0;

      if (cals < 0 || cals > 10000 || pro < 0) {
        EngineDiagnostics.recordWarning(`Invalid macros for meal ${m.name || 'Unknown'}. Skipping.`);
        continue;
      }

      const d = new Date(m.selectedAt || m.createdAt || m.date);
      if (isNaN(d.getTime())) {
        EngineDiagnostics.recordWarning(`Invalid date for meal. Skipping.`);
        continue;
      }
      if (d.getTime() > now) {
        EngineDiagnostics.recordWarning(`Future date detected for meal. Skipping.`);
        continue;
      }

      // De-duplicate same meal at same timestamp
      const uid = `${m.name}_${d.getTime()}_${cals}`;
      if (seenMap.has(uid)) {
        EngineDiagnostics.recordWarning(`Duplicate meal detected: ${m.name}. Skipping.`);
        continue;
      }
      seenMap.add(uid);

      sanitized.push(m);
    }
    return sanitized;
  },

  sanitizeWorkouts(workouts: any[]) {
    if (!Array.isArray(workouts)) return [];
    const sanitized = [];
    const seenMap = new Set<string>();
    const now = Date.now();

    for (let i = 0; i < workouts.length; i++) {
      const w = workouts[i];
      if (!w) continue;

      const d = new Date(w.date || w.createdAt);
      if (isNaN(d.getTime())) continue;
      if (d.getTime() > now) continue;

      const uid = `${w.type}_${d.getTime()}`;
      if (seenMap.has(uid)) {
        EngineDiagnostics.recordWarning(`Duplicate workout entry detected: ${w.type}. Skipping.`);
        continue;
      }
      seenMap.add(uid);

      sanitized.push(w);
    }
    return sanitized;
  },

  sanitizeWeightLogs(logs: any[]) {
    if (!Array.isArray(logs)) return [];
    const sanitized = [];
    const seenMap = new Set<string>();
    const now = Date.now();

    for (let i = 0; i < logs.length; i++) {
      const l = logs[i];
      if (!l) continue;

      const weight = l.weight || 0;
      if (weight < 20 || weight > 400) {
        EngineDiagnostics.recordWarning(`Corrupted weight log detected: ${weight}kg. Skipping.`);
        continue;
      }

      const d = new Date(l.date || l.createdAt);
      if (isNaN(d.getTime()) || d.getTime() > now) continue;

      // Ensure we only take one weight log per day
      const uid = d.toISOString().split('T')[0];
      if (seenMap.has(uid)) continue; // keep the first one
      seenMap.add(uid);

      sanitized.push(l);
    }
    return sanitized;
  }
};
