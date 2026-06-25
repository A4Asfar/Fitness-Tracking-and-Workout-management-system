const { GoogleGenerativeAI } = require('@google/generative-ai');
const Meal = require('../models/Meal');
const DailyPlan = require('../models/DailyPlan');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const WorkoutSuggestion = require('../models/WorkoutSuggestion');

const getLocalDateString = (d = new Date()) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMotivation = (goal) => {
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
};

exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({}).sort({ name: 1 });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching trainers' });
  }
};

exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ id: req.params.id });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching trainer' });
  }
};

exports.getDailyPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const generatedDate = getLocalDateString(new Date());
    
    // 1. Check if plan already exists for today
    let plan = await DailyPlan.findOne({ userId, generatedDate });
    if (plan) {
      return res.json(plan);
    }

    // 2. Generate a new plan dynamically
    const goal = user.fitnessGoal || 'general_fitness';
    const level = user.trainingLevel || 'Beginner';
    const weight = user.weight || 70; // fallback 70kg
    
    let estimatedCalories = 0;
    let warmup = [];
    let exercises = [];
    let recovery = "";
    let proteinTarget = "";
    let breakfast = "";
    let lunch = "";
    let dinner = "";
    let snack = "";
    let hydration = "";
    let motivation = "";

    let geminiSuccess = false;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a daily fitness and nutrition routine for a user with the following details:
- Goal: ${goal}
- Training Level: ${level}
- Current Weight: ${weight} kg
- Workout Focus Preference: ${user.workoutFocus || 'General'}

Your response MUST be a single, valid raw JSON object. Do not wrap it in markdown code blocks or add any other text. The JSON structure must match this exact format:
{
  "estimatedCalories": 350,
  "warmup": [
    { "exercise": "Jumping Jacks", "duration": "2 mins" },
    { "exercise": "Arm Circles", "duration": "1 min" }
  ],
  "exercises": [
    { "name": "Push Ups", "sets": 3, "reps": "12", "rest": "60s", "notes": "Keep core tight", "icon": "Dumbbell" },
    { "name": "Bodyweight Squats", "sets": 3, "reps": "15", "rest": "60s", "notes": "Go parallel", "icon": "Dumbbell" }
  ],
  "nutrition": {
    "breakfast": "Egg White Omelet with spinach",
    "lunch": "Grilled Chicken Salad",
    "dinner": "Baked Salmon and asparagus",
    "snack": "Greek Yogurt with blueberries",
    "hydration": "2.5 Liters",
    "proteinTarget": "140g"
  },
  "recovery": "10 mins of full body stretching focusing on hamstrings and calves.",
  "motivation": "Consistency beats intensity every single time."
}`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        
        if (responseText.startsWith("```")) {
          responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(responseText);
        
        estimatedCalories = parsed.estimatedCalories || 300;
        warmup = parsed.warmup || [];
        exercises = parsed.exercises || [];
        recovery = parsed.recovery || "Rest and recover.";
        motivation = parsed.motivation || "Consistency is key.";
        
        breakfast = parsed.nutrition?.breakfast || "Healthy breakfast";
        lunch = parsed.nutrition?.lunch || "Healthy lunch";
        dinner = parsed.nutrition?.dinner || "Healthy dinner";
        snack = parsed.nutrition?.snack || "Healthy snack";
        hydration = parsed.nutrition?.hydration || "2.0 Liters";
        proteinTarget = parsed.nutrition?.proteinTarget || "100g";

        geminiSuccess = true;
        console.log("🤖 Gemini successfully generated daily plan!");
      } catch (err) {
        console.error("⚠️ Gemini daily plan generation failed, using local templates:", err.message);
      }
    }

    if (!geminiSuccess) {
      // Local templates fallback
      const exerciseTemplates = await WorkoutSuggestion.find({ level: level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() });

      if (goal === 'weight_loss') {
        estimatedCalories = Math.round(weight * 6.5);
        warmup = [
          { exercise: 'Jumping Jacks', duration: '2 mins' },
          { exercise: 'High Knees', duration: '1 min' },
          { exercise: 'Arm Circles', duration: '1 min' }
        ];
        if (exerciseTemplates.length >= 2) {
          exercises = exerciseTemplates.slice(0, 4).map(t => ({
            name: t.exercise,
            sets: 4,
            reps: '15',
            rest: '45s',
            notes: t.reason,
            icon: t.icon
          }));
        } else {
          exercises = [
            { name: 'Burpees', sets: 4, reps: '15', rest: '45s', notes: 'Keep a fast pace', icon: 'Flame' },
            { name: 'Mountain Climbers', sets: 4, reps: '20 each leg', rest: '45s', notes: 'Keep hips low', icon: 'Zap' },
            { name: 'Jump Squats', sets: 3, reps: '15', rest: '60s', notes: 'Explosive jump', icon: 'Zap' }
          ];
        }
        recovery = "10 minutes of light walking followed by full-body stretching focusing on legs.";
        proteinTarget = `${Math.round(weight * 1.6)}g`;
      } else if (goal === 'muscle_gain') {
        estimatedCalories = Math.round(weight * 4.5);
        warmup = [
          { exercise: 'Dynamic Stretching', duration: '3 mins' },
          { exercise: 'Light Pushups', duration: '1 min' },
          { exercise: 'Bodyweight Squats', duration: '2 mins' }
        ];
        if (exerciseTemplates.length >= 2) {
          exercises = exerciseTemplates.slice(0, 4).map(t => ({
            name: t.exercise,
            sets: 4,
            reps: '8-10',
            rest: '90s',
            notes: t.reason,
            icon: t.icon
          }));
        } else {
          exercises = [
            { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on slow eccentric', icon: 'Dumbbell' },
            { name: 'Heavy Squats', sets: 4, reps: '6-8', rest: '120s', notes: 'Go deep and explode up', icon: 'Dumbbell' }
          ];
        }
        recovery = "Consume a protein shake within 30 minutes. Focus on static stretching for the chest and shoulders.";
        proteinTarget = `${Math.round(weight * 2.2)}g`;
      } else {
        estimatedCalories = Math.round(weight * 5.5);
        warmup = [
          { exercise: 'Light Jog in Place', duration: '2 mins' },
          { exercise: 'Arm Circles', duration: '1 min' },
          { exercise: 'Hip Rotations', duration: '1 min' }
        ];
        exercises = [
          { name: 'Push Ups', sets: 3, reps: '12', rest: '60s', notes: 'Full range of motion', icon: 'Dumbbell' },
          { name: 'Walking Lunges', sets: 3, reps: '10 each leg', rest: '60s', notes: 'Keep torso upright', icon: 'Dumbbell' },
          { name: 'Dumbbell Rows', sets: 3, reps: '12', rest: '60s', notes: 'Pull to the hip', icon: 'Dumbbell' }
        ];
        recovery = "5 minutes of yoga flows (Downward Dog to Cobra). Stay active the rest of the day.";
        proteinTarget = `${Math.round(weight * 1.8)}g`;
      }

      // Nutrition
      const dbMeals = await Meal.find({});
      const randomNutrition = [...dbMeals].sort(() => 0.5 - Math.random());
      const getMeal = (cat) => randomNutrition.find(m => m.category === cat)?.mealName || `Healthy ${cat}`;

      breakfast = getMeal('Breakfast');
      lunch = getMeal('Lunch');
      dinner = getMeal('Dinner');
      snack = getMeal('Snack');
      hydration = `${(weight * 0.033).toFixed(1)} Liters`;
      motivation = getMotivation(goal);
    }

    // Save plan to MongoDB
    plan = new DailyPlan({
      userId,
      generatedDate,
      goalType: goal,
      level,
      estimatedCalories,
      warmup,
      exercises,
      nutrition: {
        breakfast,
        lunch,
        dinner,
        snack,
        hydration,
        proteinTarget
      },
      recovery,
      motivation
    });
    
    await plan.save();
    console.log(`🤖 Generated new AI Daily Plan for user ${userId} on ${generatedDate}`);

    res.json(plan);
  } catch (error) {
    console.error('Daily plan generation error:', error);
    res.status(500).json({ message: 'Server error generating plan' });
  }
};

exports.getNutritionSuggestions = async (req, res) => {
  try {
    const { goal } = req.query;
    let query = {};
    if (goal?.includes('Loss')) query.recommendedFor = 'Weight Loss';
    else if (goal?.includes('Gain')) query.recommendedFor = 'Muscle Gain';
    else if (goal?.includes('Maintain')) query.recommendedFor = 'Maintain Fitness';
    else if (goal?.includes('Endurance')) query.recommendedFor = 'Endurance';
    
    const dbMeals = await Meal.find(query);
    const nutritionList = dbMeals.map(m => ({
      name: m.mealName,
      note: m.benefit || 'Perfect for your goal.',
      type: m.category,
      icon: m.icon,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
      benefit: m.benefit
    }));
    
    res.json(nutritionList);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching nutrition' });
  }
};

exports.getMealByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const m = await Meal.findOne({ mealName: new RegExp(`^${name}$`, 'i') });
    if (m) {
      return res.json({
        name: m.mealName,
        note: m.benefit || 'Perfect for your goal.',
        type: m.category,
        icon: m.icon,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        benefit: m.benefit
      });
    }
    return res.status(404).json({ message: 'Meal not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching meal' });
  }
};

exports.getWorkoutSuggestions = async (req, res) => {
  try {
    const { level, focus } = req.query;
    const safeLevel = level || 'Beginner';
    const safeFocus = focus || 'Strength';
    
    const suggestions = await WorkoutSuggestion.find({ 
      level: safeLevel.charAt(0).toUpperCase() + safeLevel.slice(1).toLowerCase(),
      focus: safeFocus.charAt(0).toUpperCase() + safeFocus.slice(1).toLowerCase()
    });

    if (suggestions.length === 0) {
      // Fallback to just level if focus has no matches
      const levelSuggestions = await WorkoutSuggestion.find({ 
        level: safeLevel.charAt(0).toUpperCase() + safeLevel.slice(1).toLowerCase() 
      });
      return res.json(levelSuggestions);
    }
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching workout suggestions' });
  }
};

