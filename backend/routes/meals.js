const express = require('express');
const { auth } = require('../middleware/auth');
const mealController = require('../controllers/mealController');

const router = express.Router();

router.get('/', auth, mealController.getMeals);
router.get('/recommendations', auth, mealController.getRecommendedMeals);
router.get('/meal-by-name', auth, mealController.getMealByName);
router.post('/', auth, mealController.createMeal);
router.delete('/:id', auth, mealController.deleteMeal);

module.exports = router;
