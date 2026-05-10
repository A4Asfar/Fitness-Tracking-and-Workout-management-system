/**
 * Lightweight Dynamic Recommendation Engine
 * Traces user profile values to provide personalized fitness and nutrition guidance.
 */

import { 
  Coffee, Sun, Moon, Apple, 
  Dumbbell, Flame, Zap, Trophy, 
  Info, Utensils
} from 'lucide-react-native';

export interface NutritionSuggestion {
  name: string;
  note: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  icon: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  benefit: string;
}

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Coffee': return Coffee;
    case 'Sun': return Sun;
    case 'Moon': return Moon;
    case 'Apple': return Apple;
    case 'Dumbbell': return Dumbbell;
    case 'Flame': return Flame;
    case 'Zap': return Zap;
    case 'Trophy': return Trophy;
    case 'Utensils': return Utensils;
    default: return Info;
  }
};

export interface WorkoutSuggestion {
  exercise: string;
  reason: string;
  type: 'Strength' | 'Cardio' | 'HIIT' | 'Yoga';
  icon: string;
}

/* ─── Nutrition Data Reservoir ─── */
const NUTRITION_DATABASE: Record<string, NutritionSuggestion[]> = {
  'Weight Loss': [
    { 
      name: 'Egg White Omelet', 
      note: 'High protein, minimal calories to keep you in deficit.', 
      type: 'Breakfast', icon: 'Coffee',
      calories: 180, protein: 24, carbs: 4, fats: 6,
      benefit: 'Egg whites provide high-quality leucine for muscle preservation while keeping caloric density extremely low.'
    },
    { 
      name: 'Grilled Chicken Salad', 
      note: 'Lean protein paired with fiber-rich greens.', 
      type: 'Lunch', icon: 'Sun',
      calories: 320, protein: 35, carbs: 12, fats: 14,
      benefit: 'Lean poultry and dark leafy greens maximize satiety through high volume and protein-induced thermogenesis.'
    },
    { 
      name: 'Baked Salmon & Asparagus', 
      note: 'Healthy Omega-3s with low-carb vegetable base.', 
      type: 'Dinner', icon: 'Moon',
      calories: 410, protein: 32, carbs: 8, fats: 22,
      benefit: 'Essential fatty acids support hormonal health while the low-glycemic vegetable base prevents insulin spikes.'
    },
    { 
      name: 'Greek Yogurt & Berries', 
      note: 'Satisfies sweet cravings with high protein density.', 
      type: 'Snack', icon: 'Apple',
      calories: 160, protein: 18, carbs: 15, fats: 2,
      benefit: 'Antioxidants from berries combined with slow-digesting casein protein prevent mid-day muscle breakdown.'
    },
  ],
  'Muscle Gain': [
    { 
      name: 'Steak & Eggs', 
      note: 'Classic powerhouse meal for protein and essential fats.', 
      type: 'Breakfast', icon: 'Coffee',
      calories: 650, protein: 48, carbs: 2, fats: 42,
      benefit: 'Saturated fats and cholesterol from high-quality beef support natural testosterone production for growth.'
    },
    { 
      name: 'Beef & Quinoa Bowl', 
      note: 'Complex carbs and high-quality protein for recovery.', 
      type: 'Lunch', icon: 'Sun',
      calories: 580, protein: 42, carbs: 55, fats: 18,
      benefit: 'Quinoa provides a complete amino acid profile alongside slow-release carbs to fuel heavy lifting sessions.'
    },
    { 
      name: 'Chicken & Sweet Potato', 
      note: 'Optimal for muscle glycogen replenishment.', 
      type: 'Dinner', icon: 'Moon',
      calories: 520, protein: 40, carbs: 62, fats: 8,
      benefit: 'Sweet potatoes are an excellent source of Vitamin A and potassium, essential for electrolyte balance and recovery.'
    },
    { 
      name: 'Protein Shake & Nut Butter', 
      note: 'Fast absorption protein with healthy fats.', 
      type: 'Snack', icon: 'Zap',
      calories: 340, protein: 30, carbs: 12, fats: 22,
      benefit: 'The combination of whey protein and monounsaturated fats provides a sustained release of nutrients.'
    },
  ],
  'Maintain Fitness': [
    { 
      name: 'Avocado Toast & Egg', 
      note: 'Perfect balance of healthy fats, carbs, and protein.', 
      type: 'Breakfast', icon: 'Coffee',
      calories: 380, protein: 16, carbs: 32, fats: 24,
      benefit: 'Monounsaturated fats from avocado support brain health and steady energy throughout the morning.'
    },
    { 
      name: 'Turkey & Veggie Wrap', 
      note: 'Balanced energy for active daily maintenance.', 
      type: 'Lunch', icon: 'Sun',
      calories: 420, protein: 28, carbs: 45, fats: 12,
      benefit: 'A balanced ratio of macros ensures you stay energized without feeling heavy or sluggish.'
    },
  ],
  'Endurance': [
    { 
      name: 'Oatmeal & Banana', note: 'High complex carbs for sustained energy output.', type: 'Breakfast', icon: 'Coffee',
      calories: 320, protein: 12, carbs: 62, fats: 6,
      benefit: 'Oats provide beta-glucan fiber for sustained energy release during long endurance sessions.'
    },
    { 
      name: 'Pasta with Pesto', note: 'Excellent glycogen loading for long training sessions.', type: 'Lunch', icon: 'Sun',
      calories: 550, protein: 18, carbs: 85, fats: 16,
      benefit: 'High carbohydrate density ensures glycogen stores are topped up for high-intensity endurance work.'
    },
    { 
      name: 'Brown Rice & Stir-fry', note: 'Slow-burning fuel for overnight recovery.', type: 'Dinner', icon: 'Moon',
      calories: 480, protein: 22, carbs: 70, fats: 10,
      benefit: 'Complex carbs and diverse micronutrients from vegetables support systemic recovery.'
    },
    { 
      name: 'Energy Bar', note: 'Quick carbohydrate boost for active periods.', type: 'Snack', icon: 'Zap',
      calories: 220, protein: 6, carbs: 38, fats: 8,
      benefit: 'Simple sugars provide immediate glucose for the brain and muscles during metabolic stress.'
    },
  ],
  'General Fitness': [
    { 
      name: 'Scrambled Eggs & Fruit', note: 'Simple, balanced start to your active day.', type: 'Breakfast', icon: 'Coffee',
      calories: 280, protein: 18, carbs: 22, fats: 14,
      benefit: 'A perfect balance of whole protein and natural sugars to wake up your metabolism.'
    },
    { 
      name: 'Mixed Grain Bowl', note: 'Diverse nutrients for overall health and wellness.', type: 'Lunch', icon: 'Sun',
      calories: 450, protein: 24, carbs: 55, fats: 16,
      benefit: 'Fiber-rich grains and seeds support gut health and provide steady energy for the afternoon.'
    },
    { 
      name: 'Lean Protein & Veggies', note: 'Classic healthy choice for weight management.', type: 'Dinner', icon: 'Moon',
      calories: 380, protein: 35, carbs: 15, fats: 12,
      benefit: 'High protein and low carb dinner prevents excessive calorie storage before sleep.'
    },
    { 
      name: 'Mixed Nuts', note: 'Healthy fats and protein for a quick energy pick-up.', type: 'Snack', icon: 'Apple',
      calories: 190, protein: 7, carbs: 6, fats: 16,
      benefit: 'Monounsaturated fats and vitamin E support cellular health and reduce inflammation.'
    },
  ]
};

/* ─── Workout Data Reservoir ─── */
const WORKOUT_DATABASE: Record<string, Record<string, WorkoutSuggestion[]>> = {
  'Beginner': {
    'Strength': [
      { exercise: 'Push Ups', reason: 'Master your bodyweight for upper body power.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Bodyweight Squats', reason: 'Build foundational leg strength and mobility.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Plank', reason: 'Critical for developing core stability early on.', type: 'Strength', icon: 'Zap' },
    ],
    'Cardio': [
      { exercise: 'Brisk Walking', reason: 'Safe and effective way to build aerobic capacity.', type: 'Cardio', icon: 'Flame' },
      { exercise: 'Light Jogging', reason: 'Introduce higher heart rate intervals slowly.', type: 'Cardio', icon: 'Flame' },
    ],
    'HIIT': [
      { exercise: 'Jumping Jacks', reason: 'Full body movement to improve coordination.', type: 'HIIT', icon: 'Zap' },
    ]
  },
  'Intermediate': {
    'Strength': [
      { exercise: 'Bench Press', reason: 'Compound lift for significant chest and tricep growth.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Deadlift', reason: 'King of all exercises for overall body strength.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Pull Ups', reason: 'Build an impressive back and grip strength.', type: 'Strength', icon: 'Dumbbell' },
    ],
    'Cardio': [
      { exercise: 'HIIT Sprints', reason: 'Boost metabolic rate and cardiovascular health.', type: 'HIIT', icon: 'Zap' },
      { exercise: 'Jump Rope', reason: 'Elite level conditioning and footwork.', type: 'Cardio', icon: 'Flame' },
    ],
    'Yoga': [
      { exercise: 'Sun Salutations', reason: 'Great for active recovery and flexibility.', type: 'Yoga', icon: 'Trophy' },
    ]
  },
  'Advanced': {
    'Strength': [
      { exercise: 'Weighted Pull Ups', reason: 'Take your pull strength to the absolute limit.', type: 'Strength', icon: 'Dumbbell' },
      { exercise: 'Overhead Press', reason: 'Master stability and power in the vertical plane.', type: 'Strength', icon: 'Dumbbell' },
    ],
    'HIIT': [
      { exercise: 'Mountain Climbers', reason: 'Explosive core and heart rate management.', type: 'HIIT', icon: 'Zap' },
      { exercise: 'Burpees', reason: 'The ultimate test of conditioning and power.', type: 'HIIT', icon: 'Zap' },
    ]
  }
};

/* ─── Engine Logic ─── */

/**
 * Get personalized nutrition suggestions
 */
export function getNutritionSuggestions(goal: string | undefined): NutritionSuggestion[] {
  let suggestions: NutritionSuggestion[] = [];
  
  if (goal?.includes('Loss')) suggestions = NUTRITION_DATABASE['Weight Loss'];
  else if (goal?.includes('Gain')) suggestions = NUTRITION_DATABASE['Muscle Gain'];
  else if (goal?.includes('Maintain')) suggestions = NUTRITION_DATABASE['Maintain Fitness'];
  else if (goal?.includes('Endurance')) suggestions = NUTRITION_DATABASE['Endurance'];
  else if (goal?.includes('General')) suggestions = NUTRITION_DATABASE['General Fitness'];
  else suggestions = NUTRITION_DATABASE['General Fitness']; // Fallback

  // Shuffle and return a subset to keep it fresh
  return [...suggestions].sort(() => 0.5 - Math.random()).slice(0, 4);
}

/**
 * Get a structured daily meal plan (one of each type)
 */
export function getStructuredDailyPlan(goal: string | undefined): Record<string, NutritionSuggestion> {
  const all = getNutritionSuggestions(goal);
  const plan: Record<string, NutritionSuggestion> = {};
  
  ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach(type => {
    const match = all.find(s => s.type === type);
    if (match) plan[type] = match;
    else {
      // Fallback if specific type not in random slice
      const fallback = NUTRITION_DATABASE['Maintain Fitness'].find(s => s.type === type);
      if (fallback) plan[type] = fallback;
    }
  });
  
  return plan;
}

/**
 * Get a personalized motivation note
 */
export function getMotivation(goal: string | undefined): string {
  const notes = [
    "Consistency is the key to unlocking your true potential.",
    "Small steps every day lead to massive results over time.",
    "Your only competition is the person you were yesterday.",
    "Hydration is just as important as your workout. Drink up!",
    "Recovery is where the growth happens. Don't skip your rest.",
    "Fuel your body with intention, not just convenience.",
    "The hardest part is showing up. You've already won half the battle.",
    "Focus on form over speed. Quality builds longevity."
  ];
  
  if (goal?.includes('Loss')) {
    notes.push("Every healthy choice counts towards your deficit.");
    notes.push("Focus on fiber and water to stay satiated today.");
  } else if (goal?.includes('Gain')) {
    notes.push("Ensure you hit your protein targets for optimal repair.");
    notes.push("Progressive overload is your best friend this week.");
  }

  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Find a specific meal by name across all categories
 */
export function getMealByName(name: string): NutritionSuggestion | null {
  for (const category in NUTRITION_DATABASE) {
    const meal = NUTRITION_DATABASE[category].find(m => m.name === name);
    if (meal) return meal;
  }
  return null;
}

/**
 * Get personalized workout suggestions
 */
export function getWorkoutSuggestions(level: string | undefined, focus: string | undefined): WorkoutSuggestion[] {
  const safeLevel = level || 'Beginner';
  const safeFocus = focus || 'Strength';

  const levelGroup = WORKOUT_DATABASE[safeLevel] || WORKOUT_DATABASE['Beginner'];
  let suggestions = levelGroup[safeFocus] || levelGroup['Strength'] || [];

  // If we have few suggestions for the specific focus, add general ones from that level
  if (suggestions.length < 2) {
    const fallback = levelGroup['Strength'] || [];
    suggestions = [...suggestions, ...fallback.filter(s => !suggestions.includes(s))];
  }

  return [...suggestions].sort(() => 0.5 - Math.random()).slice(0, 3);
}
