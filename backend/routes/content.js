const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  getTrainers, 
  getTrainerById, 
  getDailyPlan,
  getNutritionSuggestions,
  getMealByName,
  getWorkoutSuggestions
} = require('../controllers/contentController');

// All content routes are protected
router.use(auth);

router.get('/trainers', getTrainers);
router.get('/trainers/:id', getTrainerById);
router.get('/daily-plan', getDailyPlan);
router.get('/nutrition-suggestions', getNutritionSuggestions);
router.get('/meal', getMealByName);
router.get('/workout-suggestions', getWorkoutSuggestions);

module.exports = router;
