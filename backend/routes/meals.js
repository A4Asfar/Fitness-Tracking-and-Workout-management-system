const express = require('express');
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId }).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { mealType, mealName } = req.body;

    if (!mealType || !mealName) {
      return res.status(400).json({ message: 'Please provide meal type and name' });
    }

    const meal = new Meal({
      userId: req.userId,
      mealType,
      mealName,
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
