const express = require('express');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const router = express.Router();

const defaultWorkouts = ['Push Ups', 'Squats', 'Planks', 'Burpees', 'Lunges'];

router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId });

    if (workouts.length === 0) {
      const newWorkouts = defaultWorkouts.map(name => ({
        userId: req.userId,
        name,
        completed: false,
      }));
      await Workout.insertMany(newWorkouts);
      return res.json(newWorkouts);
    }

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { completed: !req.body.completed },
      { new: true }
    );
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
