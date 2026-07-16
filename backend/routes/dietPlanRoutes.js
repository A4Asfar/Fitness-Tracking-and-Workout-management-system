const express = require('express');
const { auth } = require('../middleware/auth');
const dietPlanController = require('../controllers/dietPlanController');

const router = express.Router();

router.get('/my-plan', auth, dietPlanController.getMyDietPlan);
router.get('/', auth, dietPlanController.getAllDietPlans);
router.post('/', auth, dietPlanController.createDietPlan);
router.put('/:id', auth, dietPlanController.updateDietPlan);
router.delete('/:id', auth, dietPlanController.deleteDietPlan);
router.post('/:id/assign', auth, dietPlanController.assignDietPlan);

module.exports = router;
