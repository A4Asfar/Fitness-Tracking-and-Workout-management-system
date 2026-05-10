const ChatHistory = require('../models/ChatHistory');
const { asyncHandler } = require('../middleware/errorMiddleware');

const RESPONSE_BANKS = {
  'weight loss': [
    "To lose weight effectively, focus on a sustainable caloric deficit. Aim for 200-500 calories below maintenance.",
    "Weight loss is a marathon, not a sprint. Prioritize high-volume, low-calorie foods like leafy greens to stay full.",
    "Combine steady-state cardio with strength training to burn fat while preserving your hard-earned muscle mass."
  ],
  'fat loss': [
    "For fat loss, keep your protein intake high (about 2g per kg of body weight) to protect muscle tissue while in a deficit.",
    "High-Intensity Interval Training (HIIT) is great for fat loss as it boosts your metabolic rate for hours after the session.",
    "Don't slash calories too low. Gradual fat loss is much easier to maintain and better for your hormonal health."
  ],
  'muscle gain': [
    "Muscle growth requires progressive overload—try to add a little weight or an extra rep every single week.",
    "To build muscle, you need a slight caloric surplus. Focus on quality complex carbs and lean protein sources.",
    "Make sure you're getting enough sleep! Muscle isn't built in the gym; it's built while you recover and rest."
  ],
  'beginner workout': [
    "Welcome to the team! Focus on the big four: Squat, Bench Press, Deadlift, and Overhead Press. Master your form first.",
    "As a beginner, a 3-day full-body split is usually the most effective way to build a solid foundation.",
    "Don't worry about fancy equipment. Focus on compound movements and consistency. Results will follow!"
  ],
  'chest workout': [
    "For chest growth, prioritize the incline dumbbell press. It targets the upper pecs for that full, powerful look.",
    "Focus on a deep stretch and a strong squeeze. Mind-muscle connection is vital for hitting the chest effectively.",
    "Don't forget your push-ups! They're a classic for a reason and great for adding volume at the end of a session."
  ],
  'leg workout': [
    "Friends don't let friends skip leg day! Squats are the king, but don't ignore lunges and Romanian deadlifts.",
    "Leg training is demanding on the CNS. Make sure you fuel up properly before a heavy leg session.",
    "Focus on driving through your heels and maintaining a neutral spine. Leg strength is the foundation of power."
  ],
  'cardio': [
    "Cardio is for your heart as much as your waistline. Aim for at least 150 minutes of moderate activity per week.",
    "Low-intensity steady state (LISS) cardio like walking is excellent for recovery and overall fat oxidation.",
    "Try to vary your cardio—cycling, swimming, and running all challenge your system in different ways."
  ],
  'hydration': [
    "Water is your secret weapon. Even 2% dehydration can significantly drop your strength and focus in the gym.",
    "Aim for 3-4 liters of water a day. If you're sweating heavily, consider adding electrolytes to your water.",
    "If you feel thirsty, you're already slightly dehydrated. Sip water consistently throughout the day."
  ],
  'protein': [
    "Protein is essential for repair. Aim for 1.6g to 2.2g of protein per kilogram of your target body weight.",
    "Spread your protein across 4-5 meals to maximize muscle protein synthesis throughout the 24-hour cycle.",
    "Don't rely solely on shakes. Whole foods like eggs, chicken, fish, and beans provide vital micronutrients too."
  ],
  'post workout meal': [
    "Recovery starts with nutrition. Aim for 20-40g of protein and some fast-digesting carbs within an hour of training.",
    "A mix of whey protein and a banana is a perfect, convenient post-workout snack to jumpstart recovery.",
    "Your post-workout meal should be easy to digest so your body can get those nutrients to your muscles quickly."
  ],
  'low calorie meal': [
    "Try 'zucchini noodles' or 'cauliflower rice' to add massive volume to your meals without the high calorie count.",
    "Lean white fish with steamed broccoli and lemon is a delicious, high-protein, very low-calorie dinner option.",
    "Egg white omelets with spinach and peppers are a nutrition powerhouse for under 200 calories."
  ],
  'motivation': [
    "Discipline will take you where motivation cannot. Focus on building habits that don't require 'feeling like it'.",
    "Remember why you started. Every drop of sweat is an investment in your future, stronger self.",
    "You don't have to be great to start, but you have to start to be great. Just show up today."
  ],
  'supplements': [
    "Supplements are the 'cherry on top'. Focus on your diet and training first before worrying about pills and powders.",
    "Creatine Monohydrate is one of the most researched and effective supplements for strength and power.",
    "A high-quality multivitamin and fish oil can help cover any nutritional gaps in a restricted calorie diet."
  ],
  'stretching': [
    "Mobility is just as important as stability. Spend 10 minutes a day on dynamic stretching to stay injury-free.",
    "Don't stretch cold muscles. Save your static stretching for after your workout when your body is warm.",
    "Focus on your hips and ankles—these areas are often tight and can cause issues up and down the kinetic chain."
  ],
  'rest day': [
    "Rest is not laziness; it's part of the program. Your muscles need time to repair the micro-tears from training.",
    "On rest days, focus on 'active recovery'—a light walk or some easy yoga to keep the blood flowing.",
    "Sleep is the ultimate recovery tool. Aim for 7-9 hours of quality shut-eye, especially after heavy training days."
  ],
  'hello': [
    "Hello! I'm your AI Fitness Assistant. Ready to smash some goals today?",
    "Hi there! How's the training going? What can I help you with today?",
    "Greetings! I'm here to provide guidance on your fitness journey. What's on your mind?"
  ],
  'thanks': [
    "You're very welcome! Keep up that great energy.",
    "No problem at all! I'm always here to help you stay on track.",
    "Happy to help! Let's keep making progress."
  ],
  'general': [
    "That's a great question! While it depends on your specific context, staying consistent with training and nutrition is the golden rule.",
    "The best plan is the one you can stick to. Focus on making small, sustainable changes to your daily routine.",
    "Every body is different, so listen to yours. Adjust your intensity and fuel based on how you're feeling and performing."
  ]
};

const getAIResponse = (query) => {
  const q = query.toLowerCase();
  
  // Define categories and their keywords
  const intentMap = [
    { category: 'weight loss', keywords: ['weight loss', 'lose weight', 'slimming', 'lose fat'] },
    { category: 'fat loss', keywords: ['fat loss', 'burn fat', 'shredding', 'cutting'] },
    { category: 'muscle gain', keywords: ['muscle gain', 'build muscle', 'bulking', 'hypertrophy', 'get big'] },
    { category: 'beginner workout', keywords: ['beginner', 'starting out', 'new to gym', 'first time'] },
    { category: 'chest workout', keywords: ['chest', 'bench press', 'pecs', 'push day'] },
    { category: 'leg workout', keywords: ['legs', 'squat', 'quads', 'hamstrings', 'leg day'] },
    { category: 'cardio', keywords: ['cardio', 'running', 'hiit', 'cycling', 'aerobic'] },
    { category: 'hydration', keywords: ['water', 'hydration', 'drink', 'thirsty'] },
    { category: 'protein', keywords: ['protein', 'whey', 'chicken', 'amino acids'] },
    { category: 'post workout meal', keywords: ['post workout', 'after gym', 'recovery meal'] },
    { category: 'low calorie meal', keywords: ['low calorie', 'diet meal', 'healthy recipe'] },
    { category: 'motivation', keywords: ['motivation', 'lazy', 'tired', 'give up', 'inspire'] },
    { category: 'supplements', keywords: ['supplement', 'creatine', 'pre workout', 'vitamins'] },
    { category: 'stretching', keywords: ['stretch', 'mobility', 'flexibility', 'warm up'] },
    { category: 'rest day', keywords: ['rest', 'recovery', 'day off', 'sleep'] },
    { category: 'hello', keywords: ['hello', 'hi', 'hey', 'greetings'] },
    { category: 'thanks', keywords: ['thanks', 'thank you', 'appreciate'] }
  ];

  for (const item of intentMap) {
    if (item.keywords.some(k => q.includes(k))) {
      const bank = RESPONSE_BANKS[item.category];
      return bank[Math.floor(Math.random() * bank.length)];
    }
  }

  // Fallback
  const fallbackBank = RESPONSE_BANKS['general'];
  return fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
};

exports.logChatMessage = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    res.status(400);
    throw new Error('Please provide a question');
  }

  // Generate AI Response on the backend
  const aiResponse = getAIResponse(question);

  const chat = await ChatHistory.create({
    userId: req.userId,
    question,
    response: aiResponse,
  });

  console.log('🤖 AI Chat processed and saved to MongoDB for user:', req.userId);
  res.status(201).json(chat);
});

exports.getChatHistory = asyncHandler(async (req, res) => {
  const history = await ChatHistory.find({ userId: req.userId }).sort({ timestamp: -1 });
  res.json(history);
});
