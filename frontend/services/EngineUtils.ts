const arrayCache = new WeakMap<any, Map<string, any>>();

export const getCached = (anchorObj: any, key: string, compute: () => any) => {
  if (!anchorObj || typeof anchorObj !== 'object') return compute();
  let objCache = arrayCache.get(anchorObj);
  if (!objCache) {
    objCache = new Map();
    arrayCache.set(anchorObj, objCache);
  }
  if (objCache.has(key)) return objCache.get(key);
  const val = compute();
  objCache.set(key, val);
  return val;
};

export const clearMemoCache = () => {
  // WeakMap auto-clears when objects are garbage collected, 
  // but if we ever need explicit resets we could handle it here.
};

export const getStartOfDay = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const calculateMaintenance = (user: any): number => {
  if (!user || !user.weight) return 2500;
  // BMR * 1.2 for sedentary maintenance approximation
  if (user.gender === 'female') return user.weight * 22 * 1.2;
  return user.weight * 24 * 1.2;
};

export const calculateTargetProtein = (user: any): number => {
  if (!user || !user.weight) return 150;
  // Target 2g / kg for muscle preservation
  return Math.round(user.weight * 2);
};

export const getDaysAgo = (days: number): Date => {
  const d = getStartOfDay();
  d.setDate(d.getDate() - days);
  return d;
};

export const filterByDate = <T extends { date?: string; selectedAt?: string; createdAt?: string }>(items: T[], daysAgo: number): T[] => {
  return getCached(items, `filterByDate_${daysAgo}`, () => {
    const cutoff = getDaysAgo(daysAgo).getTime();
    return items.filter(item => {
      const d = new Date(item.selectedAt || item.createdAt || item.date || new Date());
      return d.getTime() >= cutoff;
    });
  });
};

export const sumMacros = (meals: any[]) => {
  return getCached(meals, `sumMacros`, () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    meals.forEach(m => {
      calories += m.calories || 0;
      protein += m.protein || 0;
      carbs += m.carbs || 0;
      fats += m.fats || 0;
    });
    return { calories, protein, carbs, fats };
  });
};

export const sumWorkoutVolume = (workouts: any[]) => {
  return getCached(workouts, `sumWorkoutVolume`, () => {
    let volume = 0;
    let sets = 0;
    let reps = 0;
    let cals = 0;
    workouts.forEach(w => {
      volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      sets += w.sets || 0;
      reps += w.reps || 0;
      cals += Math.round((w.duration || 30) * 8.5);
    });
    return { volume, sets, reps, cals };
  });
};
