const express = require('express');
const { auth } = require('../middleware/auth');
const workoutController = require('../controllers/workoutController');

const router = express.Router();

router.get('/', auth, workoutController.getWorkouts);
router.get('/stats', auth, workoutController.getWorkoutStats);
router.get('/analytics', auth, workoutController.getWorkoutAnalytics);
router.get('/home-insights', auth, workoutController.getHomeInsights);
router.get('/:id', auth, workoutController.getWorkout);
router.post('/', auth, workoutController.createWorkout);
router.put('/:id', auth, workoutController.updateWorkout);
router.delete('/:id', auth, workoutController.deleteWorkout);

module.exports = router;
