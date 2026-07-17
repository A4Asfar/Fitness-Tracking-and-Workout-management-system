export const getStartOfDay = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getDaysAgo = (days: number): Date => {
  const d = getStartOfDay();
  d.setDate(d.getDate() - days);
  return d;
};

export const filterByDate = <T extends { date?: string; selectedAt?: string; createdAt?: string }>(items: T[], daysAgo: number): T[] => {
  const cutoff = getDaysAgo(daysAgo).getTime();
  return items.filter(item => {
    const d = new Date(item.selectedAt || item.createdAt || item.date || new Date());
    return d.getTime() >= cutoff;
  });
};

export const sumMacros = (meals: any[]) => {
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
};

export const sumWorkoutVolume = (workouts: any[]) => {
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
};
